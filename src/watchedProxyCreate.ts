export function createWatchedProxy<T extends object>(
	target: T,
	onChange: (prop: string | symbol, prev: any, value: any) => void
): T {
	return new Proxy(target, {
		get(target, prop) {
			return target[prop as keyof T];
		},
		set(target, prop, value) {
			const prev = target[prop as keyof T];
			// Update the value
			target[prop as keyof T] = value;
			// If value actually changed, trigger callback
			if (prev !== value) {
				onChange(prop, prev, value);
			}
			return true;
		},
	});
}

			// const watchedPlugins = createWatchedProxy(
			// 	this.app.plugins.plugins,
			// 	(prop, prev, curr) => {
			// 		console.log("plugins changed - createWatchedObject", {
			// 			prop,
			// 			prev,
			// 			curr,
			// 		});
			// 	}
            // );
            // this.app.plugins.plugins = watchedPlugins;