/**
 ** - Support upto 7 nested levels
 ** @see {@link https://github.com/microsoft/TypeScript/issues/12290}
 **/
export declare type TraverseDepthLv1<T,
    K1 extends keyof T> = [K1];

export declare type TraverseDepthLv2<T,
    K1 extends keyof T,
    K2 extends keyof T[K1]> = [K1, K2];

export declare type TraverseDepthLv3<T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2]> = [K1, K2, K3];

export declare type TraverseDepthLv4<T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3]> = [K1, K2, K3, K4];

export declare type TraverseDepthLv5<T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4]> = [K1, K2, K3, K4, K5];

export declare type TraverseDepthLv6<T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5]> = [K1, K2, K3, K4, K5, K6];

export declare type TraverseDepthLv7<T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5],
    K7 extends keyof T[K1][K2][K3][K4][K5][K6]> = [K1, K2, K3, K4, K5, K6, K7];

export declare type TraverseDepthInfinity<T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5],
    K7 extends keyof T[K1][K2][K3][K4][K5][K6]> = [K1, K2, K3, K4, K5, K6, K7, ...(number | string)[]];

/**
 ** - Support upto 7 nested levels
 ** @see {@link https://github.com/microsoft/TypeScript/issues/12290}
 **/
declare interface INextInt {
    0: 1;
    1: 2;
    2: 3;
    3: 4;
    4: 5;
    5: 6;
    6: 7;
}

/**
 ** - Support upto 7 nested levels
 ** @see {@link https://github.com/microsoft/TypeScript/issues/12290}
 **/
export declare type Traverse<Obj, Path extends Array<string | number | symbol>, Index extends number = 0> = {
    /** Need to use this object indexing pattern to avoid circular reference error !*/
    [Key in Index]: Path[Key] extends undefined
        /** Return Obj when we reach the end of the Path !*/
        ? Obj
        /** Check if the Key is in the Obj !*/
        : Path[Key] extends keyof Obj
            /** If the Value does not contain null !*/
            /** `T & {}` is a trick to remove undefined from a union type !*/
            ? Obj[Path[Key]] extends Obj[Path[Key]] & {}
                ? Traverse<Obj[Path[Key]], Path, Extract<INextInt[Key], number>>
                /** Remove the undefined from the Value, and add it to the union after !*/
                : Traverse<Obj[Path[Key]] & {}, Path, Extract<INextInt[Key], number>> | undefined
            : never
}[Index];
