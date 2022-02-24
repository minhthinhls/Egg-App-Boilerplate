/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

/** Import ES6 Default Core Dependencies !*/
// import * as path from "path";

/**!*****************************!*
 ** PUT THIS ON MAIN ENTRY FILES !
 ** WRITE RESOLVED PATH IN BOTH FILES
 ** [PACKAGE.JSON] AND [TSCONFIG.JSON]
 **!*****************************!*/
require("module-alias/register");

/** Import Installed NPM Dependencies !*/
import * as NodeCache from "node-cache";

/** Import Application Interface as Typings from Pre-Defined Types Helper !*/
import type {IApplication} from "@/extend/types";

declare module "egg" {
    export interface Application {
        /** Attributes Augmentation for Egg-Application ~!*/
        cache: InstanceType<typeof NodeCache>;
    }
}

module.exports = (app: IApplication) => {
    app.beforeStart(() => {
        /**
         ** @description - For customizing options, please review the following article.
         ** @see {@link https://www.npmjs.com/package/node-cache#options}
         **/
        const memo = new NodeCache({
            /** Standard [[Time-to-live]] by 12 hours after the last time [[key: value]] got referred ~!*/
            stdTTL: 12 * 60 * 60,
            /** To increase performance via direct references ~!*/
            useClones: false,
        });

        return Object.assign(app, {
            get cache() {
                return memo;
            },
        });
    });
};
