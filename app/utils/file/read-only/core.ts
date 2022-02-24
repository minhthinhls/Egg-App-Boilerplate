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

/** Import Glob Dependencies !*/
import * as globFileMatcher from "glob"; // import globFileMatcher = require('glob');

/** Import Global Globs Defined Types !*/
import type {IOptions as IGlobOptions} from "glob";

/** ROOT DIRECTORY FOR THIS PROJECT !*/
export const ROOT_DIRECTORY = path.resolve(__dirname, "../../../..");

/**
 ** @see {@link https://flaviocopes.com/linux-command-chmod}
 ** @see {@link https://nodejs.org/api/fs.html#fschmodpath-mode-callback}
 **/
export enum FilePermission {
    NONE = 0,
    EXEC_ONLY = 1,
    READ_ONLY = 4,
    WRITE_ONLY = 2,
    EXEC_READ = 5,
    READ_WRITE = 6,
    EXEC_WRITE = 3,
    EXEC_READ_WRITE = 7,
}

export declare interface IFileMode {
    OWNER: FilePermission;
    GROUP: FilePermission;
    OTHERS: FilePermission;
}

/**
 ** @see {@link https://flaviocopes.com/linux-command-chmod}
 ** @see {@link https://nodejs.org/api/fs.html#fschmodpath-mode-callback}
 **/
export const __SetMode__ = (modes: Partial<IFileMode> | FilePermission) => {
    if (typeof modes === "number") {
        return Number(`0o${String(modes).repeat(3)}`);
    }

    const fallback = (permission?: FilePermission) => {
        if (!permission) {
            return FilePermission.NONE;
        }
        return permission;
    };

    if (!modes.OWNER && !modes.GROUP && modes.OTHERS) {
        return Number(`0o${fallback(modes.OTHERS)}`);
    }
    if (!modes.OWNER && modes.GROUP && modes.OTHERS) {
        return Number(`0o${fallback(modes.GROUP)}${fallback(modes.OTHERS)}`);
    }
    return Number(`0o${fallback(modes.OWNER)}${fallback(modes.GROUP)}${fallback(modes.OTHERS)}`);
};

/**
 ** @see {@link https://github.com/isaacs/node-glob#options} - Click to see Glob Options
 ** @template TOptions
 ** @param {string} [targetPath]
 ** @param {function(files: Array<string>): void} [callback]
 ** @param {TOptions} [options] - Glob file matcher options
 ** @returns {void}
 **/
export const __FileLoader__ = <TOptions extends IGlobOptions = IGlobOptions>(
    targetPath?: string | null,
    callback?: (files: Array<string>) => void,
    options?: TOptions,
) => {
    globFileMatcher(`${ROOT_DIRECTORY}/${targetPath || 'app/extend/**/*.ts'}`, {...options}, (error, files) => {
        if (error !== null) {
            throw error;
        }
        return callback?.(files.sort());
    });
};

export const __SetFilePermission__ = async <TOptions extends Partial<IFileMode> | FilePermission>(
    filePath: string,
    filePermission: TOptions,
) => {
    const {fd: _fileDescriptor} = await fs.promises.open(`${path.resolve(filePath)}`, "r");
    /**
     ** @see {@link https://codeburst.io/node-js-fs-module-changing-file-permissions-and-ownership-with-file-descriptors-14749fdf3eaf}
     **/
    return fs.fchmod(_fileDescriptor, __SetMode__(filePermission), (error) => {
        if (error) {
            throw new ReferenceError(`${error.message}`);
        }
        return fs.close(_fileDescriptor, (error) => {
            if (error) {
                throw new ReferenceError(`${error.message}`);
            }
        });
    });
};

/** For ES5 Import Statement !*/
module.exports = {
    FilePermission,
    __SetMode__,
    __FileLoader__,
    __SetFilePermission__,
};
