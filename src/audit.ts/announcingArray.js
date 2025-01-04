class AnnounceArray extends Array {
	constructor(...args) {
		super(...args);
		// Return a proxy that wraps this array
		return new Proxy(this, {
			get(target, prop) {
				if (typeof prop === "string" && !isNaN(parseInt(prop))) {
					console.log("getting:", prop);
				}
				return target[prop];
			},
			set(target, prop, value) {
				if (typeof prop === "string" && !isNaN(parseInt(prop))) {
					console.log("setting:", prop, value);
				}
				target[prop] = value;
				return true;
			},
		});
	}
	push(...items) {
		console.log("pushing:", items);
		return super.push(...items);
	}

	unshift(...items) {
		console.log("unshifting:", items);
		return super.unshift(...items);
	}

	find(predicate, thisArg) {
		console.log("finding:", predicate);
		return super.find(predicate, thisArg);
	}

	filter(predicate, thisArg) {
		console.log("filtering:", predicate);
		return super.filter(predicate, thisArg);
	}

	map(callbackfn, thisArg) {
		console.log("mapping:", callbackfn);
		return super.map(callbackfn, thisArg);
	}

	reduce(callbackfn, initialValue) {
		console.log("reducing:", callbackfn);
		return super.reduce(callbackfn, initialValue);
	}

	reduceRight(callbackfn, initialValue) {
		console.log("reducing right:", callbackfn);
		return super.reduceRight(callbackfn, initialValue);
	}

	pop() {
		console.log("popping");
		return super.pop();
	}

	// add methods that allow normal access/assignment with brackets
	get(index) {
		console.log("getting:", index);
		return super[index];
	}

	set(index, value) {
		console.log("setting:", index, value);
		return (super[index] = value);
	}
}
