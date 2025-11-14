export default class RingBuffer<T> {
    private maxSize: number;
    private buffer: T[];

    constructor(maxSize: number, initialArray: T[] = []) {
        if (maxSize <= 0) {
            throw new Error("Die maximale Größe muss größer als 0 sein.");
        }
        this.maxSize = maxSize;
        this.buffer = initialArray.slice(-maxSize);
    }

    add(element: T): RingBuffer<T> {
        
        const newBufferArray = [...this.buffer, element];

        if (newBufferArray.length > this.maxSize) {
            newBufferArray.shift();
        }

        console.log("new buffer has: " + 
            newBufferArray.filter(value => value === true).length +
        " correct and " + newBufferArray.filter(value => value === false).length + " wrong");

        return new RingBuffer<T>(this.maxSize, newBufferArray);
    }

    getArray(): T[] {
        return this.buffer;
    }

    get size(): number {
        return this.buffer.length;
    }

    get capacity(): number {
        return this.maxSize;
    }

    get isFull(): boolean {
        return this.buffer.length === this.maxSize;
    }
}
