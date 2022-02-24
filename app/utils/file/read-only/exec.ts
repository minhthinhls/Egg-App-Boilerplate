import {__FileLoader__, __SetFilePermission__} from "./core";
/** Import Permission Utilities !*/
import {FilePermission} from "./core";
/** Import Typescript Supports !*/
import type {IFileMode} from "./core";

export const __PermissionHandler__ = <TOptions extends Partial<IFileMode> | FilePermission>(
    dirPath: string,
    filePermission: TOptions,
) => {
    return __FileLoader__(dirPath, (files) => {
        files.forEach((file) => {
            return __SetFilePermission__(file, filePermission);
        });
    });
};

/** For ES5 Import Statement !*/
module.exports = {__PermissionHandler__};
