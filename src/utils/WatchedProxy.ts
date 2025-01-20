export type WatchedProxyEventDetailType = "set" | "delete";

export interface WatchedProxyEventDetail<U extends object> {
	path: string;
	prop: string | symbol;
	prev: U | undefined;
	curr: U | undefined;
	type: WatchedProxyEventDetailType;
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
	path: string; // dot notation path
	maxDepth: number | null;
    depth: number;
    private cleanup: Map<string | symbol, () => void> = new Map();

	constructor(
		target: T,
		path: string = "",
		maxDepth: number | null = 1,
		depth: number = 1
	) {
		super();
		this.path = path;
		this.target = target;
		this.maxDepth = maxDepth;
		this.depth = depth;
		this.proxy = this.createProxy(target);
	}

	isValidDepth(depth: number) {
		return depth <= (this.maxDepth ?? Infinity);
	}

	isValidProxyTarget(val: unknown): val is object {
		return (
			typeof val === "object" &&
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

	shouldCreateProxy(val: unknown, nested: boolean = false): val is object {
		return (
			this.isValidDepth(this.depth + (nested ? 1 : 0)) &&
			this.isValidProxyTarget(val) &&
			!this.isWatchedProxy(val)
		);
	}

    createNestedWatchedProxy(prop: string | symbol, val: object) { 
        this.cleanup.get(prop)?.();

		const nestedWatchedProxy = new WatchedProxy(
			val,
			this.extendPath(prop),
			this.maxDepth,
			this.depth + 1
        );
        this.cleanup.set(prop, nestedWatchedProxy.onChange((e) => {
			this.dispatchEvent(
				new CustomEvent(WATCHED_PROXY_CHANGE_EVENT, {
					detail: e.detail,
				})
			);
		}));
		return nestedWatchedProxy.proxy;
	}

	extendPath(prop: string | symbol) {
		return [this.path, String(prop)].filter((v) => v !== "").join(".");
	}

	watchedProxyEvent<U extends object>(
		args: Omit<WatchedProxyEventDetail<U>, "path">
	): WatchedProxyEvent<U> {
		return new CustomEvent(WATCHED_PROXY_CHANGE_EVENT, {
			detail: {
				...args,
				path: this.extendPath(args.prop),
			},
		});
	}

	private createProxy(target: T): T & { __isWatchedProxy?: true } {
		// Don't proxy primitives or built-in objects that shouldn't be proxied
        if (!this.shouldCreateProxy(target)) {
            console.log("shouldCreateProxy", { target, this: this });
			throw new Error(
				"Cannot proxy primitive or built-in objects; or max depth reached"
			);
		}

		return new Proxy(target, {
			get: (obj, prop, receiver) => {
				if (prop === "__isWatchedProxy") return true;
                let value = Reflect.get(obj, prop, receiver);
                if (typeof value === 'function') {
                    value = value.bind(obj);
                }
				if (this.shouldCreateProxy(value, true)) {
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
                if (this.shouldCreateProxy(value, true)) {
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