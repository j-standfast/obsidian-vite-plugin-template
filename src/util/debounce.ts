type DebouncedFunction<T extends (...args: any[]) => any> = {
    (...args: Parameters<T>): ReturnType<T>;
    cancel: () => DebouncedFunction<T>;
    run: () => ReturnType<T> | undefined;
}

function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delayMs: number = 0,
    resetOnCall: boolean = false
): DebouncedFunction<T> {
    let timeoutId: number | null = null;
    let context: any = null;
    let args: Parameters<T> | null = null;
    let remainingTime = 0;
    let windowContext = window;  // Changed from activeWindow to window

    const executeFunction = () => {
        const savedContext = context;
        const savedArgs = args;
        context = null;
        args = null;
        return fn.apply(savedContext, savedArgs as Parameters<T>);
    };

    const timeoutCallback = () => {
        if (remainingTime) {
            const currentTime = Date.now();
            if (currentTime < remainingTime) {
                windowContext = window;
                timeoutId = windowContext.setTimeout(timeoutCallback, remainingTime - currentTime);
                remainingTime = 0;
                return;
            }
        }
        timeoutId = null;
        executeFunction();
    };

    const debouncedFn = function(this: any, ...callArgs: Parameters<T>) {
        context = this;
        args = callArgs;

        if (timeoutId) {
            if (resetOnCall) {
                remainingTime = Date.now() + delayMs;
            }
        } else {
            windowContext = window;
            timeoutId = windowContext.setTimeout(timeoutCallback, delayMs);
        }

        return debouncedFn;
    } as DebouncedFunction<T>;

    debouncedFn.cancel = () => {
        if (timeoutId) {
            windowContext.clearTimeout(timeoutId);
            timeoutId = null;
        }
        return debouncedFn;
    };

    debouncedFn.run = () => {
        if (timeoutId) {
            windowContext.clearTimeout(timeoutId);
            timeoutId = null;
            return executeFunction();
        }
    };

    return debouncedFn;
}

export { debounce };