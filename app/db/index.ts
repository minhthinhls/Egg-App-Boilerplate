/**!*****************************!*
 ** PUT THIS ON MAIN ENTRY FILES !
 ** WRITE RESOLVED PATH IN BOTH FILES
 ** [PACKAGE.JSON] AND [TSCONFIG.JSON]
 **!*****************************!*/
require("module-alias/register");

/** Import Environment Dependencies !*/
import "$/dotenv.config.js";

/** Import Application Placeholder from Egg:Modules !*/
import "egg";

/** Import Application Interface as Typings from Pre-Defined Types Helper !*/
import type {IApplication} from "@/extend/types";

/** Import Glob Dependencies !*/
import * as globFileMatcher from "glob"; // import globFileMatcher = require('glob');

/** Import Global Globs Defined Types !*/
import type {IOptions as IGlobOptions} from "glob";

/** Import Node Native Dependencies !*/
import * as path from "path";

/**
 ** @param {IApplication} app
 ** @param {IGlobOptions} [globOptions]
 ** @returns {Promise<void>}
 **/
export const migrate = async (app: IApplication, globOptions?: IGlobOptions) => {
    let chainMicroTasks = Promise.resolve(true);
    globFileMatcher.sync(path.resolve(__dirname, 'migrate/**/*(*.js|*.ts)'), {...globOptions}).forEach((file) => {
        chainMicroTasks = chainMicroTasks.then(async () => {
            console.log('DB MIGRATE:', file);
            try {
                return await require(path.resolve(file))(app);
            } catch (error: Error | any) {
                return console.log([
                    `Error during migrating database table named: ${file}`, error,
                ].join("\n"));
            }
        });
    });

    return await chainMicroTasks.then(() => {
        console.log('DB MIGRATE -> DONE');
    });
};

/** For ES5 Import Statement !*/
module.exports = {
    migrate,
};
