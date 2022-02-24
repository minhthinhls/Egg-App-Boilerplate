/**
 ** @constructor
 ** @template T
 **/
export class Queue<T extends any> extends Object {

    protected items: Array<T>;
    protected offset: number;

    constructor(...args: Array<T>) {
        super(...args);
        this.items = [...args];
        /** @deprecated **/
        this.offset = 0;
    }

    /**
     ** @template {T}
     ** @param {T} item
     ** @returns {Array<T>}
     **/
    public enqueue(item: T) {
        this.items.push(item);
        return this.items;
    }

    /**
     ** @private
     ** @deprecated
     ** @template {T}
     ** @returns {T}
     ** @ts-ignore ~!*/
    private _dequeue() {
        /** If the queue is empty, return immediately !*/
        if (this.items.length === 0) {
            throw new ReferenceError("The Queue has already been empty !");
        }

        /** Store the item at the front of the queue !*/
        const item = this.items[this.offset];

        /** increment the offset and remove the free space if necessary !*/
        if (++this.offset * 2 >= this.items.length) {
            this.items = this.items.slice(this.offset);
            this.offset = 0;
        }

        /** Return the dequeued item !*/
        return item;
    }

    /**
     ** @template {T}
     ** @returns {T}
     **/
    public dequeue() {
        /** If the queue is empty, return immediately !*/
        if (this.items.length === 0) {
            throw new ReferenceError("The Queue has already been empty !");
        }

        /** Return the dequeued item !*/
        return this.items.shift();
    }

    /**
     ** @private
     ** @deprecated
     ** @template {T}
     ** @returns {T}
     ** @ts-ignore ~!*/
    private _peek() {
        return this.items.length > 0 ? this.items[this.offset] : undefined;
    }

    /**
     ** @template {T}
     ** @returns {T}
     **/
    public peek() {
        return this.items.length > 0 ? this.items[0] : undefined;
    }

    /**
     ** @private
     ** @deprecated
     ** @returns {number}
     ** @ts-ignore ~!*/
    private _size() {
        return this.items.length - this.offset;
    }

    /**
     ** @returns {number}
     **/
    public size() {
        return this.items.length;
    }

    /**
     ** @returns {boolean}
     **/
    public isEmpty() {
        return this.items.length === 0;
    }

}

/** For ES6 Default Import Statement !*/
export default Queue;

/** For ES5 Default Import Statement !*/
module.exports = Queue;
