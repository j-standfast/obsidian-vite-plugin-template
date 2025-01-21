export type WatchedProxyEventDetailType = "set" | "delete";

export interface WatchedProxyEventDetail<U extends object> {
	basePath: string;
	prop: string | symbol;
	path: string;
	prev: U | undefined;
	curr: U | undefined;
	type: WatchedProxyEventDetailType;
}

export interface WatchedProxyCreateOptions {
	basePath?: string;
	excludedPaths?: string[];
	maxDepth?: number;
	depth?: number;
	verbose?: boolean;
}

export interface WatchedProxyEvent<U extends object> extends CustomEvent {
	detail: WatchedProxyEventDetail<U>;
}

const WATCHED_PROXY_CHANGE_EVENT = "WatchedProxyChangeEvent";

// TODO? https://github.com/microsoft/TypeScript/issues/28357#issuecomment-2310186394
// export type CustomEventTarget<T> = {
// }

// TODO: note the handling of sets/maps
// https://javascript.info/proxy

// TODO: 'app' is magically not a problem / not proxied when it's a property expected to be a nested proxy (and that wouldn't be good, I don't think)

export class WatchedProxy<T extends object> extends EventTarget {
	target: T;
	proxy: T & { __isWatchedProxy?: true };
	basePath: string; // dot notation path
	excludedPaths: string[] = [];
	maxDepth: number | null;
	depth: number;
	verbose: boolean;
	private cleanup: Map<string | symbol, () => void> = new Map();

	constructor(
		target: T,
		basePath: string = "",
		excludedPaths: string[] = [],
		maxDepth: number | null = 1,
		depth: number = 1,
		verbose: boolean = false
	) {
    super();
    if (verbose) {
      console.log("WatchedProxy constructor", {
        basePath,
        target,
        excludedPaths,
        maxDepth,
        depth,
        verbose,
      });
    }
		this.basePath = basePath;
		this.target = target;
		this.excludedPaths = excludedPaths;
		this.maxDepth = maxDepth;
		this.depth = depth;
		this.verbose = verbose;
		this.proxy = this.createProxy(target);
	}

	static create<T extends object>(
		target: T,
		options: WatchedProxyCreateOptions
	) {
		const {
			basePath = "",
			excludedPaths = [],
			maxDepth = 1,
			depth = 1,
			verbose = false,
		} = options;
		return new WatchedProxy(
			target,
			basePath,
			excludedPaths,
			maxDepth,
			depth,
			verbose
		);
	}

	isValidDepth(depth: number) {
		return depth <= (this.maxDepth ?? Infinity);
	}

	isValidProxyTarget(val: unknown): val is object {
		return (
			typeof val === "object" &&
			typeof val !== "function" &&
			val !== null &&
			val !== Symbol &&
			val !== Date &&
			val !== RegExp
		);
	}

	isWatchedProxy(val: object): boolean {
		return (
			val !== null &&
			typeof val === "object" &&
			(val as any).__isWatchedProxy === true
		);
	}

	shouldCreateProxy(
		val: unknown,
		nested: boolean = false,
		prop?: string | symbol
	): boolean {
		const res =
			this.isValidDepth(this.depth + (nested ? 1 : 0)) &&
			this.isValidProxyTarget(val) &&
			!this.isWatchedProxy(val) &&
      !this.excludedPaths.includes(this.extendPath(prop)); 
    
		if (this.verbose) {
			console.log("shouldCreateProxy", {
				val,
				nested,
				prop,
        this: this,
        res,
			});
		}
		return res;
	}

	createNestedWatchedProxy(prop: string | symbol, val: any) {
		this.cleanup.get(prop)?.();

		const nestedWatchedProxy = new WatchedProxy(
			val,
			this.extendPath(prop),
			this.excludedPaths,
			this.maxDepth,
			this.depth + 1
		);
		this.cleanup.set(
			prop,
			nestedWatchedProxy.onChange((e) => {
				this.dispatchEvent(
					new CustomEvent(WATCHED_PROXY_CHANGE_EVENT, {
						detail: e.detail,
					})
				);
			})
		);
		return nestedWatchedProxy.proxy;
	}

	extendPath(prop: string | symbol | undefined): string {
		if (prop === undefined) return this.basePath;
		return [this.basePath, String(prop)].filter((v) => v !== "").join(".");
	}

	watchedProxyEvent<U extends object>(
		args: Omit<WatchedProxyEventDetail<U>, "basePath" | "path">
	): WatchedProxyEvent<U> {
		return new CustomEvent(WATCHED_PROXY_CHANGE_EVENT, {
			detail: {
				...args,
				basePath: this.basePath,
				path: this.extendPath(args.prop),
			},
		});
	}

	private createProxy(target: T): T & { __isWatchedProxy?: true } {
		// Don't proxy primitives or built-in objects that shouldn't be proxied
		try {
			if (!this.shouldCreateProxy(target)) {
				console.log("shouldCreateProxy", { target, this: this });
				throw new Error(
					"Cannot proxy primitive or built-in objects; or max depth reached"
				);
			}
		} catch (e) {
			console.error("WatchedProxy / createProxy / shouldCreateProxy", {
				e,
				target,
				this: this,
			});
		}

		return new Proxy(target, {
			get: (obj, prop, receiver) => {
				if (prop === "__isWatchedProxy") return true;
				let value = Reflect.get(obj, prop, receiver);
				if (typeof value === "function") {
					if (
						prop === "checkCallback" ||
						prop === "callback" ||
						prop === "editorCheckCallback" ||
						prop === "editorCallback"
					) {
						// console.log('WatchedProxy / get / function - not binding', { prop, path, this: this, obj, value });
						return value;
					} else {
						return value.bind(obj);
					}
				} else if (this.shouldCreateProxy(value, true, prop)) {
					const proxy = this.createNestedWatchedProxy(prop, value);
					Reflect.set(obj, prop, proxy);
					return proxy;
				} else {
					return value;
				}
			},

			set: (obj: T, prop: string | symbol, value: any) => {
				// note 'this' is the WatchedProxy
				const prev = Reflect.get(obj, prop);
				if (prev === value) return true;
				// note we may not need to create a proxy here
				if (this.shouldCreateProxy(value, true, prop)) {
					value = this.createNestedWatchedProxy(prop, value);
				} else {
					this.cleanup.get(prop)?.();
				}
				Reflect.set(obj, prop, value);

				this.dispatchEvent(
					this.watchedProxyEvent({
						prop,
						prev,
						curr: value,
						type: "set",
					})
				);
				return true;
			},

			deleteProperty: (obj: T, prop: string | symbol) => {
				const prev = Reflect.get(obj, prop) as T | undefined; // TODO?
				Reflect.deleteProperty(obj, prop);
				this.cleanup.get(prop)?.();
				this.dispatchEvent(
					this.watchedProxyEvent({
						prop,
						prev,
						curr: undefined,
						type: "delete",
					})
				);
				return true;
			},
		});
	}

	onChange(callback: (event: WatchedProxyEvent<T>) => void) {
		const handler = (e: Event) => {
			callback(e as WatchedProxyEvent<T>);
		};
		this.addEventListener(WATCHED_PROXY_CHANGE_EVENT, handler);
		return () =>
			this.removeEventListener(WATCHED_PROXY_CHANGE_EVENT, handler);
	}

	unload() {
		this.cleanup.forEach((_, prop) => {
			this.cleanup.get(prop)?.();
		});
	}
}
