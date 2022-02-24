/**
 ** @constructor
 ** @template T
 **/
export class Stack<T extends any> extends Object {

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
    public push(item) {
        this.items.push(item);
        return this.items;
    }

    /**
     ** @template {T}
     ** @returns {T}
     **/
    public pop() {
        if (this.items.length <= 0) {
            throw new ReferenceError("The Stack has already been empty !");
        }
        return this.items.pop();
    }

    /**
     ** @template {T}
     ** @returns {T}
     **/
    public peek() {
        return this.items[this.items.length - 1];
    }

    /**
     ** @returns {number}
     **/
    public size() {
        return this.items.length;
    }

    /**
     ** @returns {void}
     **/
    public empty() {
        this.items.length = 0;
    }

    /**
     ** @returns {boolean}
     **/
    public isEmpty() {
        return this.items.length === 0;
    }

}

/** For ES6 Default Import Statement !*/
export default Stack;

/** For ES5 Default Import Statement !*/
module.exports = Stack;
