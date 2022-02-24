import {__Encrypt__, __Decrypt__} from "./core";

/**
 ** - Make sure all paths are sorted alphabetically.
 ** - Run this command line from Project Root Directory:
 ** @example
 ** > npx ts-node --transpile-only app/utils/crypto/rsa/test.ts
 **/
const text = "HELLO WORLD";

const encrypt = __Encrypt__(text);

console.log("\n > Encrypted:", encrypt);

console.log("\n > Decrypted:", __Decrypt__(encrypt));

console.log("\n > Final Result:", __Decrypt__(encrypt) === text);
