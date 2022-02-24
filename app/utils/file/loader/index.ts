/**!*****************************!*
 ** PUT THIS ON MAIN ENTRY FILES !
 ** WRITE RESOLVED PATH IN BOTH FILES
 ** [PACKAGE.JSON] AND [TSCONFIG.JSON]
 **!*****************************!*/
require("module-alias/register");

import * as path from "path";
/** Import Glob Dependencies !*/
import * as globFileMatcher from "glob"; // import globFileMatcher = require('glob');

/** Import Models Attributes Defined Types !*/
import type {IApplication} from "@/extend/types";

/** Import Global Globs Defined Types !*/
import type {IOptions} from "glob";

/**
 ** @see {@link https://github.com/isaacs/node-glob#options} - Click to see Glob Options
 ** @template TOptions
 ** @param {IApplication} app
 ** @param {string} [targetPath]
 ** @param {TOptions} [options]
 ** @returns {void}
 **/
export const __FileLoader__ = <TOptions extends IOptions = IOptions>(app: IApplication, targetPath?: string, options?: TOptions) => {
    const rootDir = path.resolve(__dirname, "../../../..");
    globFileMatcher(`${rootDir}/${targetPath || 'app/router/**/*.js'}`, {...options}, (error, files) => {
        if (error) throw error;
        files.forEach((file) => require(file)(app));
    });
};

/** For ES5 Import Statement !*/
module.exports = {
    exec: __FileLoader__,
};
