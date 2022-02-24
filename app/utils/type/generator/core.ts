/**!*****************************!*
 ** PUT THIS ON MAIN ENTRY FILES !
 ** WRITE RESOLVED PATH IN BOTH FILES
 ** [PACKAGE.JSON] AND [TSCONFIG.JSON]
 **!*****************************!*/
require("module-alias/register");

/** Import Environment Dependencies !*/
import "$/dotenv.config.js";

/** Import Glob Dependencies !*/
import * as globFileMatcher from "glob"; // import globFileMatcher = require('glob');

/** Import Installed NPM Dependencies !*/
import * as camelCase from "camelcase";

/** Import Global Globs Defined Types !*/
import type {IOptions} from "glob";

/** Import Installed Types from NPM Dependencies !*/
import type {Options as CamelCaseOptions} from "camelcase";

const parent = Symbol('parent');

// const PRIORITY = ['ts', 'js'];
// const NEW_LINE = "\n";
const SEMICOLON = ";";
const FOUR_SPACES = "    ";
const ESLINT_DISABLE_PREFIX = `/* eslint-disable-next-line no-unused-vars */`;

/**
 ** - If the current Pointer reach Leaf Node then Node, then its type will be <string>.
 ** - Otherwise the current Pointer will point to another <Node> as reference.
 **/
declare type Node<T> = {
    [parent]: T | null;
    [p: string]: Node<T>;
} | string;

export declare interface IHandlerOptions {
    asType: boolean;
    indent: typeof FOUR_SPACES;
    keywordHandler: ((v: string) => string) | null;
    interfaceWrapper: {
        _name: string;
        _extends?: Array<string>;
        _extraProps?: {[p: string]: string};
        _extraImports?: {[p: string]: string};
    } | null;
    /** - The output file name. Default will be `` ${dirPath} `` !*/
    fileName: string;
    camelCase: CamelCaseOptions;
}

/**
 ** - Option for Import Modules Function.
 ** @see {__ImportDependency__}
 **/
export declare interface IDependencyOptions {
    /**
     ** @example
     ** import type {} from 'node:module';
     **/
    asType: boolean;
    /**
     ** @example
     ** import * as NameSpace from 'node:module';
     **/
    asNameSpace: boolean;
    /**
     ** @example
     ** import ${select} from 'node:module';
     **/
    select: string;
}

/**
 ** - Option for Import Modules Function.
 ** @see {__ImportDependency__}
 **/
export declare type IDirectory = "controller" | "service" | "model" | "mongoose";

export const __BuildAbstractTree__ = (paths: Array<string>, dirPath: IDirectory, options?: Partial<IHandlerOptions>) => {
    const numPath = paths.length;
    const wrapperObj: {[p: string]: Node<string>} = {};
    for (let i = 0; i < numPath; i++) {
        const filePath = paths[i]; // Ex: [app/model/promotion/transfer_in/participating.ts]
        const namePath = filePath.replace(new RegExp(`(app/|${dirPath}/|.ts)`, "g"), ""); // Ex: [promotion/transfer_in/participating]
        const pathSegments = namePath.split("/").map((name) => camelCase(name, {...options?.camelCase, pascalCase: true})); // Ex: ['Promotion', 'TransferIn', 'Participating']
        const numSegments = pathSegments.length;
        /** For traversing the object with provided paths !*/
        let prevPointer: Node<string> | null = null;
        let currPointer: Node<string> = wrapperObj as Node<string>;
        /** Will be concatenated after each loop: ['Promotion'] -> ['PromotionTransferIn'] -> ['PromotionTransferInParticipating'] !*/
        let stringAccumulator = "";
        for (let i = 0; i < numSegments - 1; i++) {
            const currSegment = pathSegments[i]; // Ex: ['Promotion' | 'TransferIn' | 'Participating']
            stringAccumulator += currSegment; // Ex: ['Promotion' | 'PromotionTransferIn']
            /** Setup Pointers !*/
            prevPointer = currPointer; // Ex: [{Promotion: {TransferIn: {Participating: ...}}} | {TransferIn: {Participating: ...}}]
            const currValue = prevPointer[currSegment]; // Ex: [{TransferIn: {Participating: ...}} | {Participating: ...}]
            /** If the value has already assigned as string, means that their are 1 parent dependency wrapping outside !*/
            if (currValue && typeof currValue === "string") {
                /** Slightly modify the destination object, this will ensure Parent Dependency will be joined on Object Type !*/
                prevPointer[currSegment] = {[parent]: currValue};
                currPointer = prevPointer[currSegment]; // Ex: [{TransferIn: {Participating: ...}} | {Participating: ...}]
                continue;
            }
            if (!prevPointer[currSegment]) {
                prevPointer[currSegment] = {}; // Ex: {Promotion: {TransferIn: {Participating: PromotionTransferInParticipating}}}
            }
            currPointer = prevPointer[currSegment]; // Ex: [{TransferIn: {Participating: ...}} | {Participating: ...}]
        }
        /** Assign Dependency String to the last segment !*/
        const lastSegment = pathSegments[numSegments - 1]; // Ex: ['Participating']
        currPointer[lastSegment] = stringAccumulator + lastSegment; // Ex: ['PromotionTransferInParticipating']
    }
    return wrapperObj;
};

export const __ObjectKeysModifier__ = (obj: {[p: string]: any}, options?: Partial<IHandlerOptions>) => {
    const keys = Object.keys(obj);
    const numKeys = keys.length;

    for (let i = 0; i < numKeys; i++) {
        const currKey = keys[i];
        const currVal = obj[currKey];
        const modKey = camelCase(currKey, {...options?.camelCase});
        if (typeof currVal === "object") {
            __ObjectKeysModifier__(currVal, options);
        }
        delete obj[currKey];
        obj[modKey] = currVal;
    }

    return obj;
};

export const __ComposeInterface__ = (
    obj: {[p: string]: any} | Array<string>,
    indent: string = FOUR_SPACES,
    keywordHandler?: ((v: string) => string) | null,
    interfaceWrapper?: string | null,
) => {
    let _pre = '';
    let _in = '';
    let _post = '';

    if (interfaceWrapper) {
        _pre = `${indent}interface ${interfaceWrapper} {\n`;
        _post = `${indent}}\n`;
        indent += FOUR_SPACES;
    }

    /** - Compose array to object ['abc', 'bbc', 'ccc'] => {abc: {bbc: 'ccc'}} */
    if (Array.isArray(obj)) {
        let curr: any = obj.pop();
        while (obj.length) {
            curr = {[obj.pop()!]: curr};
        }
        obj = curr;
    }

    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {
        const val = obj[keys[i]];
        /** Reached the leaf node of this tree branch !*/
        if (typeof val === 'string') {
            _in += `${indent + keys[i]}: ${keywordHandler ? keywordHandler(val) : val};\n`;
            continue;
        }
        /** Continue traversing by recursion on this tree branch !*/
        const children = __ComposeInterface__(val, indent + FOUR_SPACES, keywordHandler);
        if (children) {
            const parentComponent = keywordHandler ? keywordHandler(val[parent]) : val[parent];
            _in += `${indent + keys[i]}: ${val[parent] ? `${parentComponent} & ` : ''}{\n${children + indent}};\n`;
        }
    }

    return `${_pre}${_in}${_post}`;
};

export const __ImportDependency__ = <TOptions extends Partial<IDependencyOptions>>(
    dirPath: IDirectory,
    filePath: string,
    options?: TOptions,
) => {
    const namePath = filePath.replace(new RegExp(`(app/|${dirPath}/|.ts)`, "g"), "");
    const pascalCase = namePath.split("/").map((name) => camelCase(name, {pascalCase: true})).join("");
    return [
        ESLINT_DISABLE_PREFIX,
        `import ${options?.asType ? 'type ' : ''}${options?.asNameSpace ? '* as ' : ''}${options?.select || pascalCase} from "@${filePath.replace(/(app|\.ts)/g, "")}"${SEMICOLON}`,
    ].join("\n");
};

/**
 ** @see {@link https://github.com/isaacs/node-glob#options} - Click to see Glob Options
 ** @template TOptions
 ** @param {string} [targetPath]
 ** @param {function(files: Array<string>): void} callback
 ** @param {TOptions} [options] - Glob file matcher options
 **/
export const __FileLoader__ = <TOptions extends IOptions = IOptions>(targetPath: string, callback: (files: Array<string>) => void, options?: TOptions) => {
    globFileMatcher(`app/${targetPath}/**/*.ts`, {...options}, (error, files) => {
        if (error !== null) {
            throw error;
        }
        return callback(files.sort());
    });
};

/** For ES5 Import Statement !*/
module.exports = {__BuildAbstractTree__, __ObjectKeysModifier__, __ComposeInterface__, __ImportDependency__, __FileLoader__};
