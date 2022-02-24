/** Export all Aggregating Sub-Modules within this folder !*/
export * from './Application';
export * from './Context';
export * from './DeepObject';
export * from './EggAppConfig';
export * from './Model';
export * from './Mongoose';
export * from './ModelAttributes';
export * from './ModelDeepAttributes';
export * from './ModelOptions';
export * from './Parameter';
export * from './Service';

import type {IndexSignatures} from "@/extend";

export declare type PlainObject<K extends IndexSignatures = string, V extends any = any> = {
    /** @typescript@4.4.0 - This feature is allowed in the typescript v4.4.0 above !*/
    [key: IndexSignatures | K]: V;
    /** @typescript@4.3.0 - Index Signature type can only be either String or Number !*/
    [key: string]: V;
};

/**
 ** - Typescript Helper to Join 2 types with Collision Properties.
 ** - Since {T1} has higher Priority compared to {T2}. Thus T1 will override T2 collision properties.
 ** @see {@link https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html}
 **/
export declare type Intersection<T1, T2> = T1 & Omit<T2, keyof T1>;

/**
 ** - Create all possible Path for Deep Querying Nested Object.
 ** @see {@link https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object}
 **/
declare type AbstractTree<T> = {
    [P in keyof T]-?: T[P] extends object
        ? [P] | [P, ...Path<T[P]>]
        : [P];
};

export declare type Path<T> = AbstractTree<T>[keyof AbstractTree<T>];

/**
 ** - Type Helper reducing Tuple pre-defined value.
 ** @see {@link https://github.com/microsoft/TypeScript/issues/12290}
 ** @see {@link https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object}
 **/
export declare type IDeepAttributesReducer</** - !*/
    T extends PlainObject,
    K1 extends keyof T,
    K2 extends keyof T[K1] = unknown,
    K3 extends keyof T[K1][K2] = unknown,
    K4 extends keyof T[K1][K2][K3] = unknown,
    K5 extends keyof T[K1][K2][K3][K4] = unknown,
    K6 extends keyof T[K1][K2][K3][K4][K5] = unknown,
    K7 extends keyof T[K1][K2][K3][K4][K5][K6] = unknown,
> = K7 extends IndexSignatures ? [K1, K2, K3, K4, K5, K6, K7]
    : K6 extends IndexSignatures ? [K1, K2, K3, K4, K5, K6]
        : K5 extends IndexSignatures ? [K1, K2, K3, K4, K5]
            : K4 extends IndexSignatures ? [K1, K2, K3, K4]
                : K3 extends IndexSignatures ? [K1, K2, K3]
                    : K2 extends IndexSignatures ? [K1, K2]
                        : K1 extends IndexSignatures ? [K1]
                            : never;
