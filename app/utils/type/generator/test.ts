import {__BuildAbstractTree__, __ObjectKeysModifier__, __ComposeInterface__} from "./core";

/**
 ** - Make sure all paths are sorted alphabetically.
 ** - Run this command line from Project Root Directory:
 ** @example
 ** > npx ts-node --transpile-only app/utils/type/generator/test
 **/
const AbstractTree = __BuildAbstractTree__([
    'app/model/promotion.ts',
    'app/model/promotion/transfer_in.ts',
    'app/model/promotion/transfer_in/participating.ts',
    'app/model/promotion/transfer_in/skip.ts',
], 'model');

console.log("AbstractTree:", AbstractTree);

console.log("Modified Object:", __ObjectKeysModifier__(AbstractTree));

console.log("Composed Interface:\n", __ComposeInterface__(AbstractTree));
