/**!*****************************!*
 ** PUT THIS ON MAIN ENTRY FILES !
 ** WRITE RESOLVED PATH IN BOTH FILES
 ** [PACKAGE.JSON] AND [TSCONFIG.JSON]
 **!*****************************!*/
require("module-alias/register");

/** Import Node Native Dependencies !*/
import * as fs from "fs";

/** Import Node Native Dependencies !*/
import * as path from "path";

/** Import Node Native Dependencies !*/
import * as crypto from "crypto";

/** Import Pre-Defined Types Helper !*/
import type {PlainObject} from "@/extend/types";

/**
 ** @see {@link https://nodejs.org/api/crypto.html} - Click to see Crypto Module Options
 ** @template TOptions
 ** @param {string} [targetPath] - The path to store files, starting from root directory.
 ** @param {TOptions} [_options]
 ** @returns {void}
 **//* eslint-disable-next-line no-unused-vars */
export const __GenerateKeyPairs__ = <TOptions extends PlainObject = {}>(targetPath?: string, _options?: TOptions) => {
    const rootDir = path.resolve(__dirname, "../../../..");

    const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: 'VCASH',
        }
    });

    /** @deprecated - Currently not in used !*//* eslint-disable-next-line no-unused-vars */// @ts-ignore
    const publicKeyInstance = crypto.createPublicKey({
        key: publicKey,
        type: 'pkcs1',
        format: 'pem',
    });

    /** @deprecated - Currently not in used !*//* eslint-disable-next-line no-unused-vars */// @ts-ignore
    const privateKeyInstance = crypto.createPrivateKey({
        key: privateKey,
        type: 'pkcs8',
        format: 'pem',
        passphrase: "VCASH",
    });

    fs.writeFileSync(`${path.resolve(rootDir, `${targetPath || './keys'}/public.pem`)}`, publicKey, {
        encoding: 'utf8'
    });

    fs.writeFileSync(`${path.resolve(rootDir, `${targetPath || './keys'}/private.pem`)}`, privateKey, {
        encoding: 'utf8'
    });
};

/**
 ** @see {@link https://nodejs.org/api/crypto.html} - Click to see Crypto Module Options
 ** @param {string} text - Encrypted text.
 ** @param {string} [targetPath] - The path to store files, starting from root directory.
 ** @returns {void}
 **//* eslint-disable-next-line no-unused-vars */
export const __Encrypt__ = (text: string, targetPath?: string) => {
    const rootDir = path.resolve(__dirname, "../../../..");
    return crypto.publicEncrypt(
        {
            key: fs.readFileSync(`${path.resolve(rootDir, `${targetPath || './keys'}/private.pem`)}`, 'utf8'),
            /** In order to decrypt the data, we need to specify the
             ** same hashing function and padding scheme that we used to
             ** encrypt the data in the previous step !*/
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
            passphrase: "VCASH",
        },
        Buffer.from(text, "utf8"),
    ).toString('base64');
};

/**
 ** @see {@link https://nodejs.org/api/crypto.html} - Click to see Crypto Module Options
 ** @param {string} text - Encrypted text.
 ** @param {string} [targetPath] - The path to store files, starting from root directory.
 ** @returns {void}
 **//* eslint-disable-next-line no-unused-vars */
export const __Decrypt__ = (text: string, targetPath?: string) => {
    const rootDir = path.resolve(__dirname, "../../../..");
    return crypto.privateDecrypt(
        {
            key: fs.readFileSync(`${path.resolve(rootDir, `${targetPath || './keys'}/private.pem`)}`, 'utf8'),
            /** In order to decrypt the data, we need to specify the
             ** same hashing function and padding scheme that we used to
             ** encrypt the data in the previous step !*/
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
            passphrase: "VCASH",
        },
        Buffer.from(text, "base64"),
    ).toString('utf8');
};

/**
 ** - See the following references.
 ** @see {@link https://boobo94.github.io/devops/tutorials/asymmetric-encryption-with-nodejs}
 ** @see {@link https://stackoverflow.com/questions/8750780/encrypting-data-with-a-public-key-in-node-js}
 **/

/** For ES5 Import Statement !*/
module.exports = {
    __Encrypt__: __Encrypt__,
    __Decrypt__: __Decrypt__,
    __GenerateKeyPairs__: __GenerateKeyPairs__,
};
