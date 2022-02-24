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
        /** @document For dependency && library reference !*/
        ///<reference types="egg-core/lib/loader/egg_loader.js"/>
        require("../../node_modules/egg-core/lib/loader/egg_loader.js");
        ///<reference types="egg-sequelize/app.js"/>
        require("../../node_modules/egg-sequelize/app.js");
        ///<reference types="egg-mongoose/app.js"/>
        require("../../node_modules/egg-mongoose/app.js");

        return app.loader.loadToApp(`${path.join(app.config.baseDir, 'app/mongoose')}`, 'models', {
            /**
             ** - Use inject property as the 1st argument when loading file as function.
             ** @example
             ** @file app/model/user.ts;
             ** > module.exports = (app: IApplication) => {...}
             ** ~!*/
            inject: app,
            /** Enable [[override]] flag so that EggLoader.loadToApp() can override collision properties ~!*/
            override: true,
            caseStyle: 'upper',
            /** @see {@link https://stackoverflow.com/questions/38740610/object-getprototypeof-vs-prototype} ~!*/
            filter(model) {
                return typeof model === 'function' && model['prototype'] instanceof app.mongoose.Model;
            },
            /**
             ** - Loading Deep Module from folder to nested property.
             ** @example
             ** @file app/mongoose/user.ts;
             ** > module.exports = (app: IApplication) => {...}
             ** @file app/mongoose/user/credit.ts;
             ** > module.exports = (app: IApplication) => {...}
             ** @access
             ** > const user = app.mongoose.User;
             ** > const credit = app.mongoose.User.Credit;
             ** @returns {*}
             ** ~!*/
            initializer(module_exports, options) {
                /**
                 ** @param {IApplication} app
                 ** @returns {*}
                 **/
                const exportFn = (app) => {
                    /** @example
                     ** @file app/model/user.ts;
                     ** > module.exports = (app: IApplication) => {...}
                     ** ~!*/
                    const model = typeof module_exports === "function" ? module_exports(app) : module_exports;
                    /** @example 'mongoose.User.Credit' ~!*/
                    const {pathName} = options;
                    /** @example ['mongoose', 'User', 'Credit'] ~!*/
                    const pathSegment = pathName.split(/\./g);

                    let current = app;
                    for (let i = 0; i < pathSegment.length; i++) {
                        const segment = pathSegment[i];
                        /** Stop & Assign on the last index !*/
                        if (i === pathSegment.length - 1) {
                            current[segment] = model;
                            break;
                        }
                        current = current[segment];
                    }
                    return model;
                };
                return exportFn.bind(null);
            },
        });
    });
};
