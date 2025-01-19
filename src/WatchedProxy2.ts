export class WatchedProxy<T extends object> extends EventTarget {
	private proxy: T;
	private path: string[];

	constructor(initialValue: T, path: string[] = []) {
		super();
		this.path = path;
		this.proxy = this.createProxy(initialValue);
	}

	private createProxy(target: any): T {
		if (
			!target ||
			typeof target !== "object" ||
			target instanceof Date ||
			target instanceof RegExp
		) {
			return target;
		}

		return new Proxy(target, {
			get: (obj, prop) => {
				console.log(
					`[Proxy Get] path=${this.path.join(".")} prop=${String(
						prop
					)}`
				);
				const value = obj[prop as keyof typeof obj];

				if (value && typeof value === "object" && !value.__isProxy) {
					const newPath = [...this.path, String(prop)];
					const nestedProxy = new WatchedProxy(value, newPath);

					nestedProxy.addEventListener("change", (event: Event) => {
						console.log(
							`[Nested Event] from path=${newPath.join(".")}`
						);
						this.dispatchEvent(
							new CustomEvent("change", {
								detail: (event as CustomEvent).detail,
							})
						);
					});

					obj[prop as keyof typeof obj] = nestedProxy.value;
					return nestedProxy.value;
				}

				return value;
			},

			set: (obj, prop, value) => {
				console.log(
					`[Proxy Set] path=${this.path.join(".")} prop=${String(
						prop
					)}`
				);
				const prevValue = obj[prop as keyof typeof obj];

				if (prevValue === value) {
					return true;
				}

				if (value && typeof value === "object" && !value.__isProxy) {
					const newPath = [...this.path, String(prop)];
					const nestedProxy = new WatchedProxy(value, newPath);
					obj[prop as keyof typeof obj] = nestedProxy.value;
				} else {
					obj[prop as keyof typeof obj] = value;
				}

				const fullPath = [...this.path, String(prop)].join(".");
				console.log(`[Dispatching Event] path=${fullPath}`);
				this.dispatchEvent(
					new CustomEvent("change", {
						detail: {
							path: fullPath,
							prop,
							prev: prevValue,
                            curr: value,
                            type: 'set'
						},
					})
				);

				return true;
			},

			deleteProperty: (obj, prop) => {
				const prevValue = obj[prop as keyof typeof obj];
				delete obj[prop as keyof typeof obj];

				const fullPath = [...this.path, String(prop)].join(".");
				this.dispatchEvent(
					new CustomEvent("change", {
						detail: {
							path: fullPath,
							prop,
							prev: prevValue,
							curr: undefined,
							type: "delete",
						},
					})
				);

				return true;
			},
		});
	}

	get value(): T {
		return this.proxy;
	}

	subscribe(
		callback: (
			path: string,
			prop: string | symbol,
			prev: any,
			curr: any,
			type?: string
		) => void
	) {
		const handler = (event: Event) => {
			const detail = (event as CustomEvent).detail;
			callback(
				detail.path,
				detail.prop,
				detail.prev,
				detail.curr,
				detail.type
			);
		};
		this.addEventListener("change", handler);
		return () => this.removeEventListener("change", handler);
	}
}
