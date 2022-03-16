/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", no-multi-assign: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

/** Import ES6 TYPES !*/
import type {DurationInputArg1, DurationInputArg2} from "moment-timezone";
import type {DebounceSettings, DebouncedFunc} from "lodash";
import type {Intersection, PlainObject} from "@/extend/types";
import type {Moment, MomentTimezone} from "moment-timezone";
import type {Path, Traverse} from "@/extend/types";
import type {FindOptions} from "sequelize/types";
/** Import ES6 Default Type Dependencies !*/
import type {Document, LeanDocument, ObjectId} from "mongoose";
/** Import ES6 Default Dependencies !*/
import {isPlainObject, isSafeInteger} from "lodash";
import {has, debounce, cloneDeep} from "lodash";
import * as moment from "moment-timezone";

/** Export ES6 Custom [Utils && Helper] Dependencies !*/
export {Console, Crypto, Vietnamese} from "@/utils";

/** Custom Types Helper !*/
export declare type AsyncTask<T> = () => Promise<T>;
/** Custom Types Helper !*/
export declare type ArrowFunc<T extends any = any> = (...args: any) => T;
/** Custom Types Helper !*/
export declare type Await<T> = T extends Promise<infer R> ? R : T;
/** Custom Types Helper !*/
export declare type IndexSignatures = string | number | symbol;
/** Custom Types Helper !*/
export declare type Primitives = boolean | IndexSignatures | Nullable;
/** Custom Types Helper !*/
export declare type Nullable<T extends any = never> = T | null | void | undefined | "";

/**
 ** - Filter remove all Optional Keys and potential Nullable values from [Key->Value] (--Linear Version--)
 ** @see {@link https://stackoverflow.com/questions/53050011/remove-null-or-undefined-from-properties-of-a-type}
 **/
export declare type NonNullableProps<T> = {
    [P in keyof T]-?: Exclude<T[P], Nullable>;
};

/**
 ** - Filter remove all Optional Keys and potential Nullable values from [Key->Value] (--Recursive Version--)
 ** @see {@link https://stackoverflow.com/questions/53050011/remove-null-or-undefined-from-properties-of-a-type}
 **/
export declare type NonNullablePropsRecursion<T> = {
    [P in keyof T]-?: NonNullableProps<NonNullable<T[P]>>
};

/**
 ** - Remove all Optional Keys and [Key->Value] that potential have Nullable values
 ** @see {@link https://stackoverflow.com/questions/53050011/remove-null-or-undefined-from-properties-of-a-type}
 **/
export declare type NonPotentialNullableProps<T> = {
    [P in keyof T]-?: (T[P] & Nullable) extends Nullable ? never : T[P];
};

/**
 ** - This will enforce Required Type Coercion for all Properties of an Object to be Required as Mandatory Attributes.
 ** - See: {@link https://stackoverflow.com/questions/47914536/use-partial-in-nested-property-with-typescript}
 **/
export declare type RecursiveRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? RecursiveRequired<T[P]> : T[P];
};

/**
 ** - This will enforce Partial Type Coercion for all Properties of an Object to be Optional.
 ** - See: {@link https://stackoverflow.com/questions/47914536/use-partial-in-nested-property-with-typescript}
 **/
export declare type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends object ? RecursivePartial<T[P]> : T[P];
};

/**
 ** - This would make every properties become Optional except for the keys specified in the K parameter.
 ** - See: {@link https://stackoverflow.com/questions/47914536/use-partial-in-nested-property-with-typescript}
 **/
export declare type PartialExcept<T, K extends keyof T> = RecursivePartial<T> & Pick<T, K>;

/**
 ** @private - With 100.000 Elements this cost total 0.5 seconds, meanwhile object-hash takes 9 seconds
 ** @param {Record<string, any>} object
 ** @returns {string} - Hashed String
 **/
export const createHash = (object: PlainObject<IndexSignatures>) => {
    let hash = '';
    /** TODO: On later Version, the keys should be sorted alphabetically !*/
    for (const [key, value] of Object.entries(object)) {
        hash += key + ':' + value + ',';
    }
    return hash;
};

/**
 ** - Check where obj has its following property.
 ** @param {Object} object
 ** @param {string} property
 ** @returns {boolean}
 ** @ts-ignore ~!*/
export const hasProperty = <T extends PlainObject, K extends keyof T>(
    object: T, property: K | Path<T>
): boolean => {// @ts-ignore */
    return has(object, property);
};

/**
 ** - Filter out all fields with undefined and empty strings in the object collection.
 ** @template T
 ** @param {Object} object
 ** @returns {Object}
 **/
export const removeNullableKeyFrom = <T extends object>(object: T): NonNullableProps<T> => {
    if (isPlainObject(object)) {
        for (const [k, v] of Object.entries(object)) {
            if (v === null || v === undefined || v === '') {
                delete object[k];
            }
        }
    }
    return object as NonNullableProps<T>;
};

/**
 ** - Lowercase all Properties Key inside the 1st Argument as Plain Object
 ** @param {Object} obj
 ** @returns {Object}
 **/
export const lowerCaseParams = (obj: {[p: string]: any}) => {
    if (isPlainObject(obj)) {
        let lowerCaseObj = {};
        for (let k in obj) {
            lowerCaseObj[k.toLowerCase()] = typeof obj[k] === "string" ? obj[k].toLowerCase() : obj[k];
        }
        return lowerCaseObj;
    }
    return obj;
};

/**
 ** - Callback Fn for array prototype filter, remove all items with either null or undefined under this Array collection.
 ** @template T
 ** @param {T | null | undefined} item
 ** @returns {boolean}
 **/
export const NonNullableOrUndefined = <T>(item: T | null | undefined): item is T => {
    return item !== null && item !== undefined;
};

/**
 ** - Convert Array of Elements extends {id: string}, into Map Collection by 2nd Argument {keyBy}.
 ** @template T
 ** @param {Array<T>} arr
 ** @param {string} keyBy
 ** @returns {Map<string, T>}
 **/
export const fromArrayToHashMap = <T extends PlainObject, K extends keyof T>(arr: Array<T>, keyBy: K): Map<T[K], T> => {
    const _Mapper = new Map<T[K], T>();
    const mapSize = arr.length;
    for (let i = 0; i < mapSize; i++) {
        _Mapper.set(arr[i][keyBy], arr[i]);
    }
    return _Mapper;
};

/**
 ** - Convert Array of Elements extends {id: string}, into Map Collection by 2nd Argument {keyByRefs}.
 ** - Version 2 now support nested [References] as Key-Index for Mapper through {keyByRefs} 2nd Argument.
 ** @template T
 ** @param {Array<T>} arr
 ** @param {string} keyByRefs
 ** @returns {Map<string, T>}
 ** @ts-ignore ~!*/
export const fromArrayToHashMapV2 = <T extends PlainObject, P extends Path<T>>(arr: Array<T>, keyByRefs: P): Map<Traverse<T, P>, T> => {
    const _Mapper = new Map<Traverse<T, P>, T>();
    const mapSize = arr.length;
    for (let i = 0; i < mapSize; i++) {
        let reference = arr[i];
        const numKeys = keyByRefs.length;
        for (let k = 0; k < numKeys; k++) {
            reference = reference[keyByRefs[k]];
        }
        _Mapper.set(reference as Traverse<T, P>, arr[i]);
    }
    return _Mapper;
};

/**
 ** - Convert Array of Elements extends {[p: string]: any}, into Map Collection by 2nd Argument {setter: (element: T) => [K, V]}.
 ** @template T, K, V
 ** @param {Array<T>} arr
 ** @param {function(element: T): [K, V]} setter
 ** @returns {Map<string, T>}
 **/
export const fromArrayToHashMapUseCallback = <T extends PlainObject, K extends string, V extends Partial<T>>(
    arr: Array<T>, setter: (element: T) => [K, V]
): Map<K, V> => {
    const _Mapper = new Map<K, V>();
    const mapSize = arr.length;
    for (let i = 0; i < mapSize; i++) {
        _Mapper.set(...setter(arr[i]));
    }
    return _Mapper;
};

/**
 ** - Convert Array of Elements extends {id: string}, into Map Collection by 2nd Argument {groupBy}.
 ** @template T
 ** @param {Array<T>} arr
 ** @param {string} keyBy
 ** @returns {Map<string, T[]>}
 **/
export const fromArrayToHashMapGroup = <T extends PlainObject, K extends keyof T>(arr: Array<T>, keyBy: K): Map<T[K], T[]> => {
    const _Mapper = new Map<T[K], T[]>();
    const mapSize = arr.length;
    for (let i = 0; i < mapSize; i++) {
        const key = arr[i][keyBy];
        if (!_Mapper.has(key)) {
            _Mapper.set(key, []);
        }
        _Mapper.get(key)?.push(arr[i]);
    }
    return _Mapper;
};

/**
 ** - Pick some specified properties from source object.
 ** @template T
 ** @param {T} object
 ** @param {Array<string>} keys
 ** @returns {Partial<T>}
 **/
export const pick = <T extends PlainObject<IndexSignatures>, K extends keyof T>(object: T, keys: Array<K>): Pick<T, K> => {
    const numKeys = keys.length;
    const destObj: Partial<Pick<T, K>> = {};
    for (let i = 0; i < numKeys; i++) {
        destObj[keys[i]] = object[keys[i]];
    }
    return destObj as Pick<T, K>;
};

/**
 ** - Pick some specified properties from source object. However this function will
 ** also remove all fields that have Nullable and Empty strings in the Object Collection.
 ** @template T
 ** @param {T} object
 ** @param {Array<string>} keys
 ** @returns {Partial<T>}
 **/
export const pickNonNullable = <T extends PlainObject<IndexSignatures>, K extends keyof T>(object: T, keys: Array<K>): Pick<T, K> => {
    const numKeys = keys.length;
    const destObj: Partial<Pick<T, K>> = {};
    for (let i = 0; i < numKeys; i++) {
        destObj[keys[i]] = object[keys[i]];
    }
    return removeNullableKeyFrom({...destObj}) as NonNullableProps<Pick<T, K>>;
};

/**
 ** - Remove some specified properties from source object.
 ** @template T
 ** @param {T} object
 ** @param {Array<string>} keys
 ** @returns {Partial<T>}
 **/
export const omit = <T extends PlainObject<IndexSignatures>, K extends keyof T>(object: T, keys: Array<K>): Omit<T, K> => {
    const numKeys = keys.length;
    const destObj: T = Object.assign({}, object);
    for (let i = 0; i < numKeys; i++) {
        delete destObj[keys[i]];
    }
    return destObj as Omit<T, K>;
};

/**
 ** - Clone Object by Optional Deep Properties.
 ** - Shallow copy object by default options.
 ** @template T, O
 ** @param {T} object
 ** @param {O} [options]
 ** @returns {T}
 **/
export const clone = <T extends object, O extends Partial<{
    /** - Default props by [FALSE] !*/
    deep: boolean;
}>>(object: T, options?: O): T => {
    if (!options?.deep) {
        /** Shallow copy !*/
        return {...object};
    }
    /** Deep copy !*/
    return cloneDeep(object);
};

/**
 ** - Merged specified properties from extended to source object.
 ** @template T, E
 ** @param {T} origin
 ** @param {E} extend
 ** @param {Partial<{override: boolean}>} [options]
 ** @returns {Intersection<E, T> | Intersection<T, E>}
 **/
export const merge = <T extends object, E extends object, O extends boolean>(
    origin: T,
    extend: E,
    options?: Partial<{
        override: O;
    }>,
): O extends true ? Intersection<E, T> : Intersection<T, E> => {
    /** Extract all visible keys from Extended Object !*/
    const keys = Object.keys(extend);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (options?.override || !origin[key]) {
            origin[key] = extend[key];
        }
    }
    return origin as O extends true ? Intersection<E, T> : Intersection<T, E>;
};

/**
 ** - Wrap callback argument into ES6 Promises with built-in setTimeout() support.
 ** - Don't use this unless you need to setTimeout for delaying purposes. Otherwise use <b>Promise.resolve();</b>
 ** @template F, R
 ** @param {F} callback
 ** @param {number} [timeout]
 ** @returns {Promise<R>}
 **/
export const promisify = <F extends (...args: any) => any>(callback: F, timeout?: number): Promise<ReturnType<F>> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            /** Try-Catch will help this function promisify Error
             ** when the inserted callback is Synchronous Task !*/
            try {
                return resolve(callback());
            } catch (error) {
                return reject(error);
            }
        }, timeout || 0);
    });
};

/**
 ** - Execute all Asynchronous Callback inside Iterable Collection. An enhanced version of <b>``${Promise.all()}``</b>
 ** @example
 **
 ** // Generate Micro Tasks API to push Asynchronous Tasks into Tasks Collection.
 ** const microTasks<T>: Array<() => Promise<T>> = [];
 **
 ** // Add Asynchronous Tasks to Micro Tasks API.
 ** microTasks.push(async () => new Promise((resolve, reject) => {
 **     return resolve(value);
 ** }));
 **
 ** // Executing Asynchronous Tasks from Micro Tasks API.
 ** return await execParallel(microTasks) || await execParallel(...microTasks);
 **
 ** @template T
 ** @param {AsyncTask<T> | Array<AsyncTask<T>>} task
 ** @param {Array<AsyncTask<T>>} [tasks]
 ** @returns {Promise<Array<T>>}
 **/
export const execParallelMicroTasks = <T>(task: AsyncTask<T> | Array<AsyncTask<T>>, ...tasks: Array<AsyncTask<T>>): Promise<Array<T>> => {
    const __TYPE_ERROR_MESSAGE__ = '>>> NOT SUPPORTED METHOD ARGUMENTS <<<';
    if (Array.isArray(task)) {
        if (tasks[0] !== undefined) {
            throw new TypeError(__TYPE_ERROR_MESSAGE__);
        }
        for (let i = 0; i < task.length; i++) {
            const microTask = task[i];
            if (typeof microTask !== "function") {
                throw new TypeError(__TYPE_ERROR_MESSAGE__);
            }
        }
        return Promise.all([
            ...task.map((task) => task()),
        ]);
    }
    const allTasks = [task, ...tasks];
    for (let i = 0; i < allTasks.length; i++) {
        const microTask = allTasks[i];
        if (typeof microTask !== "function") {
            throw new TypeError(__TYPE_ERROR_MESSAGE__);
        }
    }
    return Promise.all([
        ...[task, ...tasks].map((task) => task()),
    ]);
};

/**
 ** - Execute all Asynchronous Callback with Serializable Strategy inside Iterable Collection.
 ** - An enhanced version of <b>``${Array.reduce((prev, curr) => {prev.then(curr); return curr;})}``</b>
 ** @example
 **
 ** // Generate Micro Tasks API to push Asynchronous Tasks into Tasks Collection.
 ** const microTasks<T>: Array<(params: any) => Promise<T>> = [];
 **
 ** // Add Asynchronous Tasks to Micro Tasks API.
 ** microTasks.push(async (params: any) => new Promise((resolve, reject) => {
 **     return resolve(value);
 ** }));
 **
 ** // Executing Asynchronous Tasks from Micro Tasks API. The first argument is the resolved value of the previous task.
 ** > return await execSerialize((prevResolved, asyncMicroTask) => {...}, microTasks);
 ** // Asynchronous Micro Tasks as 2nd argument is the current callback pushed to the above Array: `microTasks`.
 ** > return await execSerialize((prevResolved, asyncMicroTask) => {...}, ...microTasks);
 **
 ** @template R, F
 ** @param {function(resolved: Await<R>, asyncMicroTask: AsyncTask<R>): R | Promise<R>} callback
 ** @param {AsyncTask<R> | Array<AsyncTask<R>>} task
 ** @param {Array<AsyncTask<R>>} [tasks]
 ** @returns {Promise<Array<R>>}
 **/
export const execSerializeMicroTasks = <R extends ReturnType<F>, F extends ArrowFunc>(
    callback: (resolved: Await<R>, asyncMicroTask: F) => R | Promise<R>,
    task: F | Array<F>, ...tasks: Array<F>
): Promise<Array<Awaited<R>>> => {
    const __TYPE_ERROR_MESSAGE__ = '>>> NOT SUPPORTED METHOD ARGUMENTS <<<';
    const serializeMicroTasks: Array<Promise<R>> = [];

    /**
     ** @description
     ** - Serializing Asynchronous Function into Multiple Continuous Execution Batch.
     ** - ~!*/
    const execMicroTasks = (microTasks: Array<F>): Promise<R | null> => {
        return microTasks.reduce((prevAsyncTask, asyncMicroTask) => {
            const currAsyncTask = prevAsyncTask.then((resolved) => {
                /** First time running [[resolved === `null`]] ~!*/
                if (typeof resolved === "object" && resolved === null) {
                    return asyncMicroTask();
                }
                if (typeof callback === "function") {
                    return callback(resolved as Await<R>, asyncMicroTask);
                }
                /** Default strategy when callback has not been typed as function ~!*/
                return asyncMicroTask();
            });
            serializeMicroTasks.push(currAsyncTask);
            return currAsyncTask;
        }, new Promise(resolve => resolve(null)) as Promise<R | null>);
    };

    if (Array.isArray(task)) {
        if (tasks[0] !== undefined) {
            throw new TypeError(__TYPE_ERROR_MESSAGE__);
        }
        for (let i = 0; i < task.length; i++) {
            const microTask = task[i];
            if (typeof microTask !== "function") {
                throw new TypeError(__TYPE_ERROR_MESSAGE__);
            }
        }
        /**
         ** @description
         ** - Awaiting `execMicroTasks()` to make sure all batch are successfully fetched.
         ** - Awaiting `serializeMicroTasks` to unwrap all [Promise<records>, Promise<records>, ...] into [<records>, <records>, ...].
         **/
        return execMicroTasks([...task]).then(() => {
            return Promise.all([
                ...serializeMicroTasks,
            ]);
        });
    }
    const allTasks = [task, ...tasks];
    for (let i = 0; i < allTasks.length; i++) {
        const microTask = allTasks[i];
        if (typeof microTask !== "function") {
            throw new TypeError(__TYPE_ERROR_MESSAGE__);
        }
    }
    /**
     ** @description
     ** - Awaiting `execMicroTasks()` to make sure all batch are successfully fetched.
     ** - Awaiting `serializeMicroTasks` to unwrap all [Promise<records>, Promise<records>, ...] into [<records>, <records>, ...].
     **/
    return execMicroTasks([...[task, ...tasks]]).then(() => {
        return Promise.all([
            ...serializeMicroTasks,
        ]);
    });
};

/**
 ** - This function will Ensure the Returns Data will not Resolved as either [Undefined] or [Null] !
 ** @template T
 ** @param {T | null | void | undefined} argument
 ** @param {string} [message] - Error Message
 ** @returns {T}
 **/
export const ensure = <T extends any>(argument: T | null | void | undefined, message?: string): T => {
    if (argument === null || argument === undefined) {
        throw new TypeError(message || "The Generic Argument has [[Nullable]] value !");
    }
    return argument as T;
};

/** - Customized Options for Lodash Debounce Function !*/
declare interface IDebounceOptions<T extends ArrowFunc = ArrowFunc> extends DebounceSettings {
    wait?: number;
    maxWait?: number;
    leading?: boolean;
    trailing?: boolean;
    /** Be careful, cached arguments should be deep copied instead of shallow copy,
     ** to avoid Garbage Collections from removing object refs from Heap Memory !*/
    callbackArgs?: Parameters<T>;
}

/** - Customized extra Properties for Optional Debounce Function !*/
declare interface IDebounceFunction<T extends ArrowFunc = ArrowFunc> extends DebouncedFunc<T> {
    run: (...args: Parameters<T>) => ReturnType<DebouncedFunc<T>>;
}

/**
 ** - A custom debounce function that can use both methods:
 ** @example
 ** this.constructor(...args: Array<any>)
 ** this.run(...args: Array<any>)
 ** @param {ArrowFunc} callbackFn
 ** @param {IDebounceOptions<ArrowFunc>} [options]
 ** @returns {string} - Hashed String
 **/
export const debounceFn = <T extends ArrowFunc = ArrowFunc>(
    callbackFn: T,
    options?: IDebounceOptions<T>,
): IDebounceFunction<T> => {
    const debounceFn = debounce(callbackFn, options?.wait, pick({
        ...options
    }, ['maxWait', 'leading', 'trailing']));
    return merge(debounceFn, {
        run: (...args: Parameters<T>) => debounceFn(...args),
    }) as IDebounceFunction<T>;
};

export class BenchMarker {

    /** @description - Key will be combined [label, msg, timestamp]. Value is `timestamp` ~!*/
    private readonly __TimeTable__: PlainObject<string, number> = {};
    /** @description - Key will be combined [label, msg, timestamp]. Value is `memory` ~!*/
    private readonly __MemoTable__: PlainObject<string, number> = {};

    constructor() {
        this.__TimeTable__ = {};
        this.__MemoTable__ = {};
    }

    protected hash(...args: Array<Primitives>) {
        return args.filter(Boolean).map(String).join("-");
    }

    /**
     ** @param {string} label
     ** @param {string | null} [msg]
     ** @returns {number} -- Time starting this benchmark.
     **/
    public start(label: string, msg?: string | null): number {
        const timeStart = Date.now();
        const memoStart = process.memoryUsage().heapUsed / 1024 / 1024;
        const hashKey = this.hash(label, msg, timeStart);
        this.__TimeTable__[hashKey] = timeStart;
        this.__MemoTable__[hashKey] = memoStart;
        /** Whether `this.end()` method does not provide `timeStart` ~!*/
        this.__TimeTable__[this.hash(label, msg)] = timeStart;
        /** Whether `this.end()` method does not provide `timeStart` ~!*/
        this.__MemoTable__[this.hash(label, msg)] = memoStart;
        return timeStart;
    }

    /**
     ** @param {string} label
     ** @param {string | null} [msg]
     ** @param {number} [timeStart]
     ** @returns {Required<{
     **   time: [number, number, number] | Array<number>,
     **   memo: [number, number, number] | Array<number>,
     ** }>} -- Call this function when finish this benchmark strategy.
     **/
    protected finish(label: string, msg?: string | null, timeStart?: number): Required<{
        time: [number, number, number];
        memo: [number, number, number];
    }> {
        const __TimeEnd__ = Date.now();
        const __MemoEnd__ = process.memoryUsage().heapUsed / 1024 / 1024;
        const hashKey = this.hash(label, msg, timeStart);
        const __TimeStart__ = timeStart ? this.__TimeTable__[hashKey] : this.__TimeTable__[this.hash(label, msg)];
        const __MemoStart__ = timeStart ? this.__MemoTable__[hashKey] : this.__MemoTable__[this.hash(label, msg)];
        return ({
            time: [__TimeStart__, __TimeEnd__, __TimeEnd__ - __TimeStart__],
            memo: [__MemoStart__, __MemoEnd__, __MemoEnd__ - __MemoStart__],
        });
    }

    /**
     ** @param {number} milliseconds
     ** @returns {Array<string | number>}
     **/
    protected millisToMinutesAndSeconds = (milliseconds: number): Array<string | number> => {
        const [second, minute/*, hour*/] = [1000, 60000, 3600000];
        const minutes = Math.floor(milliseconds / minute);
        milliseconds %= minute;
        const seconds = Math.floor(milliseconds / second);
        milliseconds %= second;
        return [minutes, "m:", seconds < 10 ? 0 : '', seconds, 's', milliseconds, 'ms'];
    };

    protected printTime(time: Array<number>, label: string, msg?: string | null): void {
        const [/*start*/, /*finish*/, different] = time;
        console.log(`>>> ${label} [${msg || ''}] ~ TIME DIFFERENCES:`, ...this.millisToMinutesAndSeconds(different));
    }

    protected printMemo(memo: Array<number>, label: string, msg?: string | null): void {
        const [start, finish, different] = memo;
        const parse = (value: number) => Number.parseFloat((value || NaN).toFixed(3));
        console.log(`>>> ${label} [${msg || ''}] ~ MEMORY DIFFERENCES:`, parse(start), '->', parse(finish), '===', parse(different), 'MegaBytes <<<');
    }

    /**
     ** @param {string} label
     ** @param {string | null} [msg]
     ** @param {number} [timeStart]
     ** @returns {void} -- Call this function when finish this benchmark strategy.
     **/
    public end(label: string, msg?: string | null, timeStart?: number): void {
        const {time, memo} = this.finish(label, msg, timeStart);
        this.printTime(time, label, msg);
        this.printMemo(memo, label, msg);
        /** Flush data to avoid memory leak ~!*/
        if (typeof timeStart === "number") {
            delete this.__TimeTable__[this.hash(label, msg, timeStart)];
            delete this.__MemoTable__[this.hash(label, msg, timeStart)];
        }
    }

}

export const __BenchMarker__ = new BenchMarker();

/**
 ** - A custom benchmark function that can estimate both Sync and Async Functions:
 ** @see {@link https://stackoverflow.com/questions/38508420/how-to-know-if-a-function-is-async}
 ** @template F, R
 ** @example
 ** > ctx.helper.benchmark(() => {
 **     return void 0;
 ** });
 ** > ctx.helper.benchmark(() => {
 **     return Promise.resolve(void 0);
 ** });
 ** > ctx.helper.benchmark(async () => {
 **     return void 0;
 ** });
 ** @param {ArrowFunc<R>} callbackFn
 ** @param {string} [message]
 ** @returns {ReturnType<ArrowFunc<R>>}
 **/
export const benchmark = <R extends Promise<unknown> | Primitives | Object, F extends ArrowFunc<R> = ArrowFunc<R>>(
    callbackFn: F,
    message?: string,
): ReturnType<F> => {
    const isAsyncFunc = callbackFn.constructor.name === "AsyncFunction";
    /** START BENCHMARK ~!*/
    const startTime = __BenchMarker__.start(`BENCHMARK ${isAsyncFunc ? 'ASYNCHRONOUS' : 'SYNCHRONOUS'} FUNCTION`, message || null);
    /** START BENCHMARK ~!*/

    if (callbackFn.constructor.name === "AsyncFunction") {
        return (callbackFn() as Promise<R>).then((output) => {
            /** END BENCHMARK ~!*/
            __BenchMarker__.end(`BENCHMARK ASYNCHRONOUS FUNCTION`, message || null, startTime);
            /** END BENCHMARK ~!*/
            return output;
        }) as ReturnType<F>;
    }

    const output: R = callbackFn() as R;
    /**
     ** - In case the callback function is general function that return Promise Instance.
     ** - The response value must be treated as Asynchronous via Promise Resolve API.
     ** @see {@link https://stackoverflow.com/questions/38508420/how-to-know-if-a-function-is-async}
     **/
    if (output instanceof Promise) {
        return output.then((output) => {
            /** END BENCHMARK ~!*/
            __BenchMarker__.end(`BENCHMARK SYNCHRONOUS FUNCTION`, message || null, startTime);
            /** END BENCHMARK ~!*/
            return output;
        }) as ReturnType<F>;
    }
    /** END BENCHMARK ~!*/
    __BenchMarker__.end(`BENCHMARK SYNCHRONOUS FUNCTION`, message || null, startTime);
    /** END BENCHMARK ~!*/
    return output as ReturnType<F>;
};

/**
 ** - This function will returns an Array of [Date-Moment | Date-String] within specified [start, end] Range !
 ** @param {string} startDate
 ** @param {string} endDate
 ** @param {Object} [options]
 ** @param {function(moment: Moment): string | Moment | MomentTimezone} [options.formatCb]
 ** @returns {Array<string>}
 **/
export const getDates = <T extends "YYYY-MM-DD" | string, R extends string | Moment | MomentTimezone>(
    startDate: T,
    endDate: T,
    options?: Partial<{
        formatCb: (moment: Moment) => R;
        timezone: "Atlantic/Azores" | "ASIA/Ho_Chi_Minh";
        step: DurationInputArg1;
        unit: DurationInputArg2;
    }>
) => {
    const dateList: Array<string | Moment | MomentTimezone> = [];
    let startDateMoment = moment.tz(startDate, options?.timezone || "ASIA/Ho_Chi_Minh");
    const endDateMoment = moment.tz(endDate, options?.timezone || "ASIA/Ho_Chi_Minh");
    while (startDateMoment <= endDateMoment) {
        dateList.push(options?.formatCb?.(moment(startDateMoment)) || moment(startDateMoment).format('YYYY-MM-DD'));
        startDateMoment = moment(startDateMoment).add(options?.step || 1, options?.unit || 'day');
    }
    return [...dateList] as Array<(string | Moment | MomentTimezone) extends R ? string : R>;
};

/**
 ** - Resolve [pageSize] && [pageNo] into MySQL Query Projection Properties as [limit] && [offset] !
 ** @param {{pageSize: string | number, pageNo: string | number}} args
 ** @returns {Pick<FindOptions, "limit" | "offset"> & {limit: number, offset: number}}
 **/
export const extractPagingProps = <T extends Pick<FindOptions, "limit" | "offset">>(args: {
    pageSize: string | number;
    pageNo: string | number;
}): Pick<FindOptions, "limit" | "offset"> => {
    if ([typeof args.pageSize, typeof args.pageNo].some(type => type !== "string" && type !== "number")) {
        throw new TypeError("Either [pageSize] or [pageNo] must be typed as [String] or [Number] =>");
    }
    const pageSize = Number(args.pageSize);
    const pageNo = Number(args.pageNo);

    if (isNaN(pageSize) || isNaN(pageNo)) {
        throw new TypeError("Either [pageSize] or [pageNo] becomes [NaN] when casting [Number] =>");
    }
    if (!isSafeInteger(pageSize) || !isSafeInteger(pageNo)) {
        throw new TypeError("Either [pageSize] or [pageNo] must be [Safe_Integer] =>");
    }
    return ({
        offset: Number(args.pageSize) * Number(args.pageNo),
        limit: Number(args.pageSize),
    }) as T;
};

/**
 ** - Delimiting the String into Array of Limited String.
 ** @param {Array<string> | Nullable | string} argument
 ** @param {RegExp | string} [separator]
 ** @returns {Nullable<Array<string>>}
 **/
export const delimiter = <T extends Array<string> | Nullable | string>(argument: T, separator?: RegExp | string): Nullable<Array<string>> => {
    return Array.isArray(argument)
        ? ensure(argument as Array<string>).filter(Boolean)
        : typeof argument === "string"
            ? (argument as string).split(separator || ' ').filter(Boolean)
            : null as Nullable<Array<string>>;
};

export namespace mongoose {

    declare type IDocument = Primitives | ObjectId | Document<ObjectId>;

    declare interface IComparator extends Required<{
        /* [[Mandatory Attributes Placeholder]] */
    }>, Partial<{
        /* [[Optional Attributes Placeholder]] */
        $in: Array<IDocument>;
        $nin: Array<IDocument>;
        $gt: IDocument;
        $gte: IDocument;
        $lt: IDocument;
        $lte: IDocument;
    }> {
        /* [[Default Attributes Placeholder]] */
    }

    declare interface IQueryHelper<O extends PlainObject = {}> extends Required<{
        /* [[Mandatory Attributes Placeholder]] */
    }>, Partial<{
        /* [[Optional Attributes Placeholder]] */
    }>, PlainObject<string, IComparator> {
        /* [[Default Attributes Placeholder]] *//* @ts-ignore */
        $or: Array<IQueryHelper>;
    }

    /**
     ** - For storing all RegExp that has been built.
     ** @protected
     ** @type {PlainObject<string, RegExp>}
     **/
    export const __RegexPool__: PlainObject<string, RegExp> = {};

    /**
     ** - Query with Comparator to filter Mongoose Records within NodeJS Allocated Memory Instance.
     ** @example
     ** //====================================================================//
     ** > const willKeep = compare(1997, {
     **   $in: [1997, 1998, 1999, 2000],
     **   $nin: [1993, 1994, 1995, 1996],
     **   $gt: 1990,
     ** });
     ** > console.log(willKeep === true); // returns true;
     ** //====================================================================//
     ** > const willKeep = compare(1997, {
     **   $in: [1997, 1998, 1999, 2000],
     **   $nin: [1997, 1994, 1995, 1996],
     **   $gt: 1997,
     ** });
     ** > console.log(willKeep === false); // returns false;
     ** //====================================================================//
     ** @template T
     ** @param {Primitives | Document<ObjectId>} target
     ** @param {Primitives | IComparator} comparator
     ** @returns {boolean} - Returns <true> whether `$target` satisfy `$comparator`.
     **/
    export function compare(target: Primitives | Document<ObjectId>, comparator: Primitives | IComparator): boolean {
        /** Joint Condition to decide whether this record satisfy `$comparator` after process execution ~!*/
        let __joint__ = true;
        /** - In case Attributes has been populated, then check its `_id` instead.
         ** - But sometime, populated attributes failed joining Nullable Record ~!*/
        const __target__ = (typeof target === "object" && target !== null) && target._id?.toString() || target?.toString() || target;
        /** TODO: Currently support only [`$in`, `$nin`, `$gt`, `$gte`, `$lt`, `$lte`] operator ~!*/
        if (typeof comparator === "object") {
            /** Join condition on every check includes ~!*/
            if (comparator?.$in && typeof comparator.$in === "object") {
                __joint__ = comparator?.$in?.includes(__target__) && __joint__;
            }
            /** Join condition on every check not includes ~!*/
            if (comparator?.$nin && typeof comparator.$nin === "object") {
                __joint__ = !(comparator?.$nin?.includes(__target__)) && __joint__;
            }
            /** Join condition on every check via ``$greater_than`` Operator ~!*/
            if (typeof comparator?.$gt === "number") {
                __joint__ = (comparator.$gt < (__target__ as number)) && __joint__;
            }
            /** Join condition on every check via ``$greater_than_or_equal`` Operator ~!*/
            if (typeof comparator?.$gte === "number") {
                __joint__ = (comparator.$gte <= (__target__ as number)) && __joint__;
            }
            /** Join condition on every check via ``$less_than`` Operator ~!*/
            if (typeof comparator?.$lt === "number") {
                __joint__ = (comparator.$lt > (__target__ as number)) && __joint__;
            }
            /** Join condition on every check via ``$less_than_or_equal`` Operator ~!*/
            if (typeof comparator?.$lte === "number") {
                __joint__ = (comparator.$lte >= (__target__ as number)) && __joint__;
            }
        } else {
            /** Regular Expression value of filter ~!*/
            if (typeof comparator === "string" && comparator.startsWith("/")) {
                let builtRegExp = __RegexPool__[comparator];
                if (!builtRegExp) {
                    const partitionIndex = comparator.lastIndexOf("/");
                    const regex = comparator.slice(1, partitionIndex);
                    const flag = comparator.slice(partitionIndex + 1);
                    /** Cache Built RegExp ~!*/
                    builtRegExp = __RegexPool__[comparator] = new RegExp(regex, flag);
                }
                /** Regular Expression value of filter ~!*/
                __joint__ = builtRegExp.test(target as string) && __joint__;
            } else {
                /** Primitives value of filter ~!*/
                __joint__ = (comparator === target) && __joint__;
            }
        }
        return __joint__;
    }

    export const __RegExp__ = {
        validObjectId: new RegExp("^[0-9a-fA-F]{24}$"),
    };

    export namespace ObjectId {
        export function isValid(_id: string | ObjectId) {
            if (typeof _id !== "string" && typeof _id !== "object") {
                return false;
            }
            if (typeof _id === "object") {
                /** Mongoose ver6 can stringify ObjectId correctly, unlike ver3 ~!*/
                return __RegExp__.validObjectId.test(_id.toString());
            }
            return __RegExp__.validObjectId.test(_id);
        }
    }

    /**
     ** - Querying Mongoose Records within NodeJS Allocated Memory Instance.
     ** @template T
     ** @param {Array<T>} records
     ** @param {Partial<{
     **   select: string | Array<string>,
     **   condition: Object,
     ** }>} [projection]
     ** @returns {Array<Partial<T>>}
     **/
    export function query<T extends LeanDocument<{}>, P extends Partial<{
        select: string | Array<string>;
        condition: PlainObject;
        /** Populated value can be either split string "key1 key2" or Array<string> ~!*/
        populate: PlainObject<string, Array<string> | string>;
    }>>(records: Array<T>, projection?: P): Array<Partial<T>> {

        const data: Array<Partial<T>> = [];
        const length = records.length;
        const select = delimiter(projection?.select, /[, ;]/g);

        const conditionKeys = Object.keys(projection?.condition || {});
        /** HIGH PERFORMANCE FOR-LOOP ~!*/
        for (let i = 0; i < length; i++) {
            const record = records[i];
            /** HIGH PERFORMANCE ATTRIBUTES FILTER ~!*/
            let skipRecord = false;
            for (let k = 0; k < conditionKeys.length; k++) {
                const key = conditionKeys[k];
                const condition: Primitives | IQueryHelper = projection?.condition?.[key];
                /** TODO: Whether key equals `$or` operator. Will not skip if there are at least 1 condition matched ~!*/
                if (key === "$or" && typeof condition === "object") {
                    let willKeep = false;
                    const length = condition?.length || 0;
                    for (let argc = 0; argc < length; argc++) {
                        const subCondition = (condition as NonNullable<typeof condition>)[argc];
                        const subConditionKeys = Object.keys(subCondition || {});
                        for (let subIndex = 0; subIndex < subConditionKeys.length; subIndex++) {
                            const subKey = subConditionKeys[subIndex];
                            willKeep = compare(record[subKey], subCondition[subKey]) || willKeep; // Only skip when all arguments failed !
                        }
                    }
                    skipRecord = !willKeep || skipRecord;
                } else {
                    /** WHETHER COMPARING TWO MONGOOSE OBJECT-ID. TYPE CHECKING MUST BE STRINGIFY PARSED ~!*/
                    if (ObjectId.isValid(condition as string) && ObjectId.isValid(record[key])) {
                        skipRecord = !compare((record[key] as ObjectId).toString(), condition as Primitives) || skipRecord;
                    } else {
                        skipRecord = !compare(record[key], condition as Primitives) || skipRecord;
                    }
                }
                /** Will not need to check this record anymore ~!*/
                if (skipRecord) {
                    break;
                }
            }
            if (skipRecord) {
                continue;
            }

            /** COPY INSTANCE FOR SERIALIZING CLIENT RESPONSE DATA ~!*/
            const __copy__ = {};
            /** WHETHER SELECT IS NOT AN OPTION. FETCH EVERY ATTRIBUTES ~!*/
            if (!select && typeof select !== "string") {
                const keys = Object.keys(record);
                const numKeys = keys.length;
                for (let k = 0; k < numKeys; k++) {
                    const key = keys[k];
                    __copy__[key] = record[key]?._id?.toString() || record[key];
                }
            }
            /** HIGH PERFORMANCE ATTRIBUTES PICKER ~!*/
            if (select && typeof select === "object") {
                for (let k = 0; k < select.length; k++) {
                    const key = select[k];
                    __copy__[key] = record[key]?._id?.toString() || record[key];
                }
            }
            /** HIGH PERFORMANCE POPULATED ATTRIBUTES PICKER ~!*/
            const populateKeys = Object.keys(projection?.populate || {});
            for (let k = 0; k < populateKeys.length; k++) {
                const populateKey = populateKeys[k];
                const value = projection?.populate?.[populateKey];
                if (typeof value !== "string" && !Array.isArray(value)) {
                    continue; // Skip this populated since its format violate Mongoose Populate Rule.
                }
                if (Array.isArray(value) && value.length > 0 && typeof value[0] !== "string") {
                    continue; // Skip this populated since its format violate Mongoose Populate Rule.
                }
                const select = delimiter(value, /[, ;]/g);

                /** WHETHER POPULATE KEYS SELECTION IS NOT AN OPTION. FETCH EVERY ATTRIBUTES ~!*/
                if (!select || !select.length) {
                    __copy__[populateKey] = record[populateKey];
                    continue;
                }
                __copy__[populateKey] = typeof __copy__[populateKey] !== "string" ? {...__copy__[populateKey]} : {};
                /** HIGH PERFORMANCE POPULATED KEYS FOR-LOOP ~!*/
                for (let pk = 0; pk < select.length; pk++) {
                    const subKey = select[pk];
                    if (record === null || record === undefined) {
                        continue; // Sometime MongoDB populate execution failed.
                    }
                    if (record[populateKey] === null || record[populateKey] === undefined) {
                        continue; // Sometime MongoDB populate execution failed.
                    }
                    __copy__[populateKey][subKey] = record[populateKey][subKey];
                }
            }
            data.push(__copy__);
        }

        return data;
    }

}

export namespace Cron {

    /**
     ** @constructor
     ** @param {function(): any} callback
     ** @param {number} timeout
     ** @returns {AsyncTask}
     **/
    const AsyncTask = function (this: typeof AsyncTask, callback: ArrowFunc, timeout = NaN) {
        if (this.finished) {
            return true;
        }
        /**
         ** @template T
         ** @returns {Promise<T> | T}
         **~!*/
        const execTask = () => {
            const value = callback.call(this);
            if (!(value instanceof Promise)) {
                return AsyncTask.call(this, callback, timeout);
            }
            return value.then(AsyncTask.bind(this, callback, timeout));
        };
        /** Cron Task will execute immediately on Timeout Interval ~!*/
        if (!this.immediate) {
            /** This $scope only run for once during Cron Task Process ~!*/
            this.immediate = true;
            return execTask();
        }
        /** Cron Task will execute every once after installed Timeout Interval ~!*/
        return setTimeout(() => {
            return execTask();
        }, !isNaN(timeout) ? timeout : 60 * 1000);
    };

    /**
     ** - Polling callback will try executing the callback multiple times.
     ** - Until the value resolved or rejected by reaching maximum try amount.
     ** @param {function(): any} callback
     ** @param {number} timeout
     ** @returns {Promise<AsyncTask>}
     **/
    export const polling = (
        callback: (this: typeof AsyncTask, resolve: <T>(value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void,
        timeout = NaN,
    ): Promise<typeof AsyncTask> => new Promise(function (resolve, reject) {
        const $scope = {i: 0};
        const maxSafeTry = 100;
        return new AsyncTask(function (this: typeof AsyncTask) {
            if (++$scope.i > maxSafeTry) {
                return reject(new Error(`Reach limited max safe try: ${maxSafeTry}`));
            }
            return callback.call(this, (resolver) => {
                /** Prevent AsyncTask from Continuous Running after Successfully Polling ~!*/
                this.finished = true;
                return resolve(resolver);
            }, reject);
        }, timeout);
    });

}
