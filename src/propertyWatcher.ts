export class PropertyWatcher<T> {
    private intervalId: number | null = null;
    private lastValue: T;
  
    constructor(
      private getter: () => T,
      private onChange: (prev: T, curr: T) => void,
      private pollInterval: number = 100 // milliseconds
    ) {
      this.lastValue = getter();
    }
  
    start() {
      if (this.intervalId) return; // Already running
      
      this.intervalId = window.setInterval(() => {
        const currentValue = this.getter();
        if (currentValue !== this.lastValue) {
          this.onChange(this.lastValue, currentValue);
          this.lastValue = currentValue;
        }
      }, this.pollInterval);
    }
  
    stop() {
      if (this.intervalId) {
        window.clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  }