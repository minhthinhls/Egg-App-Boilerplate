/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

/** Import Node Native Dependencies !*/
import * as v8 from "v8";
/** Import Node Native Dependencies !*/
import * as vm from "vm";

/**!*****************************!*
 ** PUT THIS ON MAIN ENTRY FILES !
 ** WRITE RESOLVED PATH IN BOTH FILES
 ** [PACKAGE.JSON] AND [TSCONFIG.JSON]
 **!*****************************!*/
require("module-alias/register");

/** Import Application Interface as Typings from Pre-Defined Types Helper !*/
import type {IApplication} from "@/extend/types";

/**
 ** - Declare Merging Error Class as Global Augmentation.
 ** @see {@link https://www.merixstudio.com/blog/typescript-declaration-merging/}
 ** - Must config ${global} key inside [.eslintrc.js] or ESLint will thrown [undefined variable] Error.
 ** @see {@link https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals}
 **/
declare global {
    /**
     ** Only available if `--expose-gc` is passed to the process.
     ** @ts-ignore ~!*/
    const gc: () => void;
}

/**
 ** @description - Egg-Application does not support `--node-options--expose-gc`.
 ** @see {@link https://github.com/legraphista/expose-gc}.
 ** @see {@link https://www.npmjs.com/package/expose-gc}.
 **/
module.exports = (app: IApplication) => {
    app.beforeStart(() => {
        /**
         ** @description - Egg-Application does not support `--node-options--expose-gc`.
         ** @see {@link https://github.com/legraphista/expose-gc}.
         ** @see {@link https://www.npmjs.com/package/expose-gc}.
         **/
        v8.setFlagsFromString('--expose-gc');

        return global.gc = vm.runInNewContext('gc');
    });
};
