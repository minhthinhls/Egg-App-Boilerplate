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
import type {EggAppInfo, Context} from "egg";
/** Import ES6 Custom [Utils && Helper] Dependencies !*/
import type {RecursivePartial} from "@/extend";
/** Import ES6 Custom [Utils && Helper] Dependencies !*/
import type {IEggAppConfig} from "@/extend/types";

/** Export Redis Registered Instance as Type Dependencies !*/
export type IRedisInstance = 'user' | 'auth' | 'userInfo' | 'config';

/**
 ** @see {@link https://github.com/eggjs/egg/blob/master/config/config.default.js/}
 ** @param {EggAppInfo} appInfo - Egg Application Detail Information.
 ** @returns {IEggAppConfig} - Egg Application Detail Configuration.
 **/
export default (appInfo: EggAppInfo): RecursivePartial<IEggAppConfig> => ({

  /** [EGG-VALIDATE] Plugin when enable will construct Parameter Instance !*/
  validate: {
    convert: true,
    validateRoot: true,
  },

  /** @see {@link https://eggjs.org/api/Config.html#multipart} !*/
  static: {
    dir: './app/public',
    prefix: '/public',
    maxAge: 0,
  },

  keys: appInfo.name + '_1557145862828_145',

  middleware: [],

  cluster: {
    listen: {
      port: 7003,
    },
  },

  bodyParser: {
    jsonLimit: '10mb',
    formLimit: '10mb',
  },

  security: {
    csrf: false,
    domainWhiteList: [
      '*', // TODO: Refactor on later version.
      $ENV.VCASH_MEMBER_CLIENT_SITE,
    ].filter(Boolean),
  },

  passportLocal: {
    usernameField: 'username',
    passwordField: 'password',
  },

  title: 'Egg-App-Boilerplate',

  /** Database configuration [Required] !*/
  sequelize: {
    dialect: ($ENV.SQL_DIALECT as Dialect) || 'mysql',
    host: $ENV.MYSQL_HOST || '127.0.0.1',
    port: Number($ENV.MYSQL_PORT) || 3306,
    database: $ENV.MYSQL_DB || 'egg_app_boilerplate',
    username: $ENV.MYSQL_USER || 'root',
    password: $ENV.MYSQL_PASS || '1111qqqq@Q',
    timezone: $ENV.MYSQL_TIMEZONE || '+07:00',
    logging: String($ENV.EGG_LOGGER).toUpperCase() !== "FALSE",
  },

  /** Database configuration [Required] !*/
  mongoose: {
    client: {
      url: [
        `mongodb://`,
        `${encodeURIComponent($ENV.MONGO_USER as string)}`,
        `:`,
        `${encodeURIComponent($ENV.MONGO_PASS as string)}`,
        `@`,
        `${$ENV.MONGO_HOST}`,
        `:`,
        `${$ENV.MONGO_PORT}`,
        `/`,
        `${$ENV.MONGO_DB}`,
      ].join(""),
      options: {},
      /** Mongoose global plugins, expected a function or an array of function and options !*/
      // plugins: [createdPlugin, [updatedPlugin, pluginOptions]],
    },
    /** @ts-ignore ~!*/
    loadModel: false,
  },

  /** Email configuration information [optional, use test account by default] !*/
  mailer: {
    // host: 'smtp.2980.com',
    // port: 25,
    // secure: false,
    secure: true,
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: $ENV.HOST_EMAIL,
      clientId: $ENV.CLIENT_ID,
      clientSecret: $ENV.CLIENT_SECRET,
      refreshToken: $ENV.REFRESH_TOKEN,
    },
  },

  /** Own mailbox, used for notification reports !*/
  email: 'edgar@v3t.io',

  /** @see {@link https://github.com/eggjs/egg-cors/blob/master/app.js/} */
  cors: {
    /** @type {function(ctx: Context): void} */
    origin: (ctx: Context): string => {
      /** - Origin is `${protocol}://${hostname}:${port}` !*/
      const origin = ctx.get('origin');
      /** Block Client Request when `Request Headers: Origin` got omitted !*/
      if (!origin) {
        return "";
      }

      if (typeof ctx.isSafeDomain !== 'function') {
        return origin;
      }

      /** @see {@link https://www.w3schools.com/nodejs/nodejs_url.asp} */
      const parsedUrl = new URL(origin);
      if (ctx.isSafeDomain(parsedUrl.hostname) || ctx.isSafeDomain(origin)) {
        return origin;
      }

      /** Default Blocking Unsafe Request from Client !*/
      return "";
    },
    credentials: true,
    allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'].join(","),
    allowHeaders: [
      'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials',
      'Accept', 'Authorization', 'Content-Type', 'X-Requested-With', 'Origin',
      'cancelRequest', 'errorAlert', 'successAlert', 'isLoading', 'responseType', 'token',
    ].join(","),
    exposeHeaders: 'Content-Disposition',
  },

  io: {
    init: {wsEngine: 'ws'}, // Passed to engine.io
    namespace: {
      '/': {
        connectionMiddleware: ['auth'],
      },
    },
    /** - If your Socket.IO service is powered by multi server, you must think about cluster solution.
     ** - It can't work without cluster like broadcast, rooms and so on !
     **/
    redis: {
      host: $ENV.REDIS_HOST || '127.0.0.1',
      port: $ENV.REDIS_PORT || 6379,
      auth_pass: $ENV.REDIS_PASSWORD || '1111qqqq@Q',
      db: $ENV.REDIS_DB || 3,
    },
  },

  /**
   ** @see {@link https://github.com/eggjs/egg-redis/}
   ** @see {@link https://www.npmjs.com/package/egg-redis/}
   **/
  redis: {
    clients: {
      /** Store User JWT Logged Token as {[username: string]: [JWT: string]} !*/
      user: {
        host: $ENV.REDIS_HOST || '127.0.0.1',
        port: Number($ENV.REDIS_PORT) || 6379,
        password: $ENV.REDIS_PASSWORD || '1111qqqq@Q',
        db: $ENV.REDIS_DB ? Number(+$ENV.REDIS_DB + 1) : 1,
      },
      /** Store User JWT Logged Token as {[JWT: string]: [username: string]} !*/
      auth: {
        host: $ENV.REDIS_HOST || '127.0.0.1',
        port: Number($ENV.REDIS_PORT) || 6379,
        password: $ENV.REDIS_PASSWORD || '1111qqqq@Q',
        db: $ENV.REDIS_DB ? Number(+$ENV.REDIS_DB + 2) : 2,
      },
      /** Store User Real-time Detail Information as {[username: string]: {[p: string]: any}} !*/
      userInfo: {
        host: $ENV.REDIS_HOST || '127.0.0.1',
        port: Number($ENV.REDIS_PORT) || 6379,
        password: $ENV.REDIS_PASSWORD || '1111qqqq@Q',
        db: $ENV.REDIS_DB ? Number(+$ENV.REDIS_DB + 3) : 3,
      },
      /** Store System Configurations as {[p: string]: any} */
      config: {
        host: $ENV.REDIS_HOST || '127.0.0.1',
        port: Number($ENV.REDIS_PORT) || 6379,
        password: $ENV.REDIS_PASSWORD || '1111qqqq@Q',
        db: $ENV.REDIS_DB ? Number(+$ENV.REDIS_DB + 4) : 4,
      },
    }
  },

  /** Accept a single file with the name `image` */
  multipart: {
    mode: 'file',
    whitelist: [
      /** Allowed image types */
      '.png', '.jpeg', '.jpg', '.gif',
      /** Allowed excel types */
      '.csv', '.xlsx',
    ],
  },

});
