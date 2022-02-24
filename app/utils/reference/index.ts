import {Console} from "../logger";

/**
 ** @param {Object} object
 ** @returns {boolean}
 **/
export const isEmptyObject = (object: object) => {
    for (let key in object) {
        return !key;
    }
    return true;
};

/**
 ** - This is to set value into specified reference if it reaches to the final reference,
 ** and will not assign any thing if it reaches undefined value before setting the value
 ** @template T
 ** @param {Object | Array<*>} rootReference
 ** @param {Array<string>} restReferences
 ** @param {T} setValue
 ** @returns {void | T}
 **/
export const setReference = <T extends object>([rootReference, ...restReferences]: [T, string], setValue: any) => {
    if (!restReferences || !restReferences.length) {
        throw new ReferenceError("Cannot set root reference. Please provide sub references !");
    }
    let finalReference = rootReference;
    for (let i = 0; i < restReferences.length - 1; i++) {
        const key = restReferences[i];
        if (typeof (finalReference = finalReference[key]) !== 'object') {
            return Console.trace([`> Cannot reach key ${key} of non-object types data !\n`], 4);
        }
    }

    const lastKey = restReferences[restReferences.length - 1];
    return finalReference[lastKey] = setValue;
};

/**
 ** - This is to get value from specified reference if it reaches to the final reference,
 ** and will not return any thing if it reaches undefined value before getting the value
 ** @param {Object | Array<*>} rootReference
 ** @param {Array<string>} restReferences
 ** @returns {*}
 **/
export const getReference = <T extends object>([rootReference, ...restReferences]: [T, string]) => {
    let finalReference = rootReference;
    for (const key of restReferences) {
        if (typeof finalReference !== 'object') {
            return Console.trace([`> Cannot reach key ${key} of non-object types data !\n`], 4);
        }
        finalReference = finalReference[key];
    }

    return finalReference;
};

/** For ES5 Import Statement !*/
module.exports = {isEmptyObject, getReference, setReference};
