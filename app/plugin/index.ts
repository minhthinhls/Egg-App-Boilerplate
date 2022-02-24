/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

/** Import ES6 Default Core Dependencies !*/
const path = require('path');

/**!*****************************!*
 ** PUT THIS ON MAIN ENTRY FILES !
 ** WRITE RESOLVED PATH IN BOTH FILES
 ** [PACKAGE.JSON] AND [TSCONFIG.JSON]
 **!*****************************!*/
require("module-alias/register");

/** Import Application Interface as Typings from Pre-Defined Types Helper !*/
import type {IApplication} from "@/extend/types";

module.exports = (app: IApplication) => {
    app.beforeStart(() => {
        /** User Defined Routers ~!*/
        return new app.loader.FileLoader({
            directory: path.join(app.baseDir, 'app/plugin'),
            /**
             ** @take-note
             ** - Ignore this file itself to avoid infinity recursion on file loader.
             ** - Ignore Egg Plugin since ``egg.(js|ts)`` is used as type declaration.
             **~!*/
            ignore: ['index.(js|ts)', 'egg.(js|ts)'],
            target: {},
            /**
             ** - Use inject property as the 1st argument when loading file as function.
             ** @example
             ** @file app/router/user.(js|ts);
             ** > module.exports = (app: IApplication) => {...}
             ** ~!*/
            inject: app,
            /** Enable [[override]] flag so that EggLoader.load() can override collision properties ~!*/
            override: true,
        }).load();
    });
};
