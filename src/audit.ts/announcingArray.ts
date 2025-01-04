class AnnouncingArray<T> extends Array<T> {
    constructor(...args: any[]) {
        super(...args);
    }

    push(...items: T[]) {
      console.log("pushing:", items);
      return super.push(...items);
    }

    unshift(...items: T[]) {
      console.log("unshifting:", items);
      return super.unshift(...items);
    }

    find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined {
      console.log("finding:", predicate);
      return super.find(predicate, thisArg);
    }

    filter(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T[] {
      console.log("filtering:", predicate);
      return super.filter(predicate, thisArg);
    }

    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
      console.log("mapping:", callbackfn);
      return super.map(callbackfn, thisArg);
    }

    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T {
      console.log("reducing:", callbackfn);
      return super.reduce(callbackfn, initialValue);
    }

    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T {
      console.log("reducing right:", callbackfn);
      return super.reduceRight(callbackfn, initialValue);
    }

    pop() {
      console.log("popping");
      return super.pop();
    }
    
    // add methods that allow normal access/assignment with brackets
    get(index: number): T {
      console.log("getting:", index);
      return super[index];
    }

    set(index: number, value: T) {
      console.log("setting:", index, value);
      return super[index] = value;
    }
}
  

// same but without type annotations
class AnnouncingArray extends Array {
    constructor(...args) {
        super(...args);
    }

    push(...items: any[]) {
        console.log("pushing:", items);
        return super.push(...items);
    }   


}
