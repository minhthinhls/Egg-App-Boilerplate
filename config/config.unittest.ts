/* eslint valid-jsdoc: "off", complexity: "off" */

"use strict";

/**!*****************************!*
 ** PUT THIS ON MAIN ENTRY FILES !
 ** WRITE RESOLVED PATH IN BOTH FILES
 ** [PACKAGE.JSON] AND [TSCONFIG.JSON]
 **!*****************************!*/
require('module-alias/register');

/** Import Environment Dependencies !*/
import "$/dotenv.config.js";

const $ENV = process.env;

/** Import ES6 Default Type Dependencies !*/
import type {Dialect} from "sequelize";
/** Import Application Placeholder from Egg:Modules !*/
import type {EggAppInfo} from "egg";
/** Import ES6 Custom [Utils && Helper] Dependencies !*/
import type {RecursivePartial} from "@/extend";
/** Import ES6 Custom [Utils && Helper] Dependencies !*/
import type {IEggAppConfig} from "@/extend/types";

/**
 ** @see {@link https://github.com/eggjs/egg/blob/master/config/config.default.js/}
 ** @param {EggAppInfo} appInfo - Egg Application Detail Information.
 ** @returns {IEggAppConfig} - Egg Application Detail Configuration.
 **/
export default (appInfo: EggAppInfo): RecursivePartial<IEggAppConfig> => ({

  /** For logging purposes. Check whether Unit Test takes this argument !*/
  title: `VCash Unit Test - ${appInfo.name}`,

  /** Database configuration [Required] !*/
  sequelize: {
    dialect: ($ENV.SQL_DIALECT as Dialect) || 'mysql',
    host: '127.0.0.1',
    port: Number($ENV.MYSQL_PORT) || 3306,
    database: 'vcash_unittest',
    username: $ENV.MYSQL_USER || 'root',
    password: $ENV.MYSQL_PASS || '1111qqqq@Q',
    timezone: $ENV.MYSQL_TIMEZONE || '+07:00',
    logging: String($ENV.EGG_LOGGER).toUpperCase() !== "FALSE",
  },

  /** Email configuration information [optional, use test account by default] !*/
  mailer: {
    secure: true,
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'edgar@v3t.io',
      clientId: $ENV.CLIENT_ID,
      clientSecret: $ENV.CLIENT_SECRET,
      refreshToken: $ENV.REFRESH_TOKEN,
    },
  },

});
