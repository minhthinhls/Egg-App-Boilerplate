/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

/** Import ENUMS & CONSTANTS !*/
import {ERROR_CODE, ROLE} from "@/constants";

/** Import ES6 Default Dependencies !*/
import {isPlainObject} from "lodash";
/** Import ES6 Default Dependencies !*/
import * as HttpError from "http-errors";

/** Import ES6 Custom [Utils && Helper] Dependencies !*/
import type {Primitives, RecursiveRequired} from "@/extend/helper";

/** Sequelize TRANSACTION & LOCKER INTERFACES !*/
import type {Transaction} from "sequelize/types/lib/transaction";

/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";

/** Import ES6 Custom [Utils && Helper] Dependencies !*/
import type {IApplication, IContext, IMongoose, PlainObject} from "@/extend/types";

declare type Nullable<V> = V | null;

declare type Stringify<V> = string;

export declare interface IBody extends PlainObject, Partial<{
    data: Nullable<Primitives | IBody>;
    /** When response with no error -> [code == 0] !*/
    errorCode: 0 | number;
    errorMsg: Error | string;
    success: boolean;
    msg: string;
}> {
    /* [[Interface Attributes Placeholder]] */
}

export declare interface IApplicationContext {
    app: IApplication;
    body: NonNullable<Primitives> | IBody;
    Op: IApplication["Sequelize"]["Op"];
    mongoose: IMongoose;
    print: Primitives | IBody;
    realIP: string;
    /** - Fetching latest User Instance from Sequelize Database !*/
    getUser: (this: IContext, user: Partial<IUserAttributes>) => Promise<IUserAttributes | null>;
    /** - Fetching latest multiple Users Instance from Sequelize Database !*/
    getManyUsers: (this: IContext, ...args: Array<string>) => Promise<Array<IUserAttributes> | []>;
    /** - Fetching latest multiple Users Instance from Sequelize Database into Redis Database !*/
    refreshRedisCachedUsers: (this: IContext, ...args: Array<string>) => Promise<void>;
    /** - Reload new User Instance from Sequelize Database into ``${ctx.user}`` reference !*/
    reload: <TOptions extends Partial<{
        /** @description * Passing Transaction Instance will set reload execute only after Transaction Committed !*/
        transaction: Transaction;
        /** @description * Passing ``${user.key}`` to refresh user detail information in RedisDB for real-time access !*/
        users: Array<string | 'id' | 'email' | 'username'>;
    }>>(this: IContext, force?: boolean, options?: TOptions) => Promise<IUserAttributes | void>;
    /** - Context Prototype Shorthand for Getter Methods !*/
    get: PlainObject<'X-Real-IP' | 'X-Forwarded-For', string>;
    ip: string;
}

/** @ts-ignore **/
export const __Context__: IContext = {
    /**
     ** - Return all operators of Sequelize
     ** @see {@link https://sequelize.org/master/manual/model-querying-basics.html#operators}
     **/
    get Op() {
        return this.app.Sequelize.Op;
    },

    get mongoose() {
        return this.app.mongoose;
    },

    get print() {
        return this.body;
    },

    get realIP() {
        return this.get['X-Real-IP'] || this.get['X-Forwarded-For'] || this.ip;
    },

    /**
     ** - Fetching latest User Instance from Sequelize Database.
     ** @params {Partial<IUserAttributes>} user - User latest fully information.
     ** @returns {Promise<IUserAttributes | null>}
     **/
    async getUser(this: IContext, user: Partial<IUserAttributes>): Promise<IUserAttributes | null> {
        /** Pick User directly form MySQL Database !*/
        const _user: RecursiveRequired<IUserAttributes> = await this.model.User.findOne({
            where: this.helper.removeNullableKeyFrom({
                id: user.id,
                email: user.email,
                username: user.username,
            }),
            include: [{
                model: this.model.Role,
                as: 'role',
                /** Some how Egg-Application have not yet Initialize Association. Thus it must be specified explicit !*/
                association: "role",
                attributes: ['id', 'name'],
            }, {
                model: this.model.Level,
                as: 'level',
                /** Some how Egg-Application have not yet Initialize Association. Thus it must be specified explicit !*/
                association: "level",
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                },
            }, {
                model: this.model.Credit,
                as: 'credit',
                /** Some how Egg-Application have not yet Initialize Association. Thus it must be specified explicit !*/
                association: "credit",
                attributes: {
                    exclude: ['uid', 'createdAt', 'updatedAt'],
                },
            }],
            attributes: {
                exclude: ['role_id', 'level_id', 'roleId', 'levelId', 'creditId', 'createdAt', 'updatedAt'],
            },
            nest: true,
            raw: true,
        }) as RecursiveRequired<IUserAttributes>;

        if (!_user) throw new SystemError(">>> Cannot found corresponding User to fetch into Context Request && RedisDB Cache <<<");

        return _user;
    },

    /**
     ** - Fetching latest multiple Users Instance from Sequelize Database.
     ** @params {Array<string>} args - Can be either following user properties: [id, email, username].
     ** @returns {Promise<Array<IUserAttributes> | []>}
     **/
    async getManyUsers(this: IContext, ...args: Array<string>): Promise<Array<IUserAttributes> | []> {
        /** Pick User directly form MySQL Database !*/
        const users: Array<RecursiveRequired<IUserAttributes>> = await this.model.User.findAll({
            where: this.helper.removeNullableKeyFrom({
                /** Optional picking either [[id]] or [[email]] or [[username]] !*/
                [this.Op.or]: [{
                    id: {[this.Op.in]: args},
                }, {
                    email: {[this.Op.in]: args},
                }, {
                    username: {[this.Op.in]: args},
                }],
            }),
            include: [{
                model: this.model.Role,
                as: 'role',
                /** Some how Egg-Application have not yet Initialize Association. Thus it must be specified explicit !*/
                association: "role",
                attributes: ['id', 'name'],
            }, {
                model: this.model.Level,
                as: 'level',
                /** Some how Egg-Application have not yet Initialize Association. Thus it must be specified explicit !*/
                association: "level",
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                },
            }, {
                model: this.model.Credit,
                as: 'credit',
                /** Some how Egg-Application have not yet Initialize Association. Thus it must be specified explicit !*/
                association: "credit",
                attributes: {
                    exclude: ['uid', 'createdAt', 'updatedAt'],
                },
            }],
            attributes: {
                exclude: ['role_id', 'level_id', 'roleId', 'levelId', 'creditId', 'createdAt', 'updatedAt'],
            },
            nest: true,
            raw: true,
        }) as Array<RecursiveRequired<IUserAttributes>>;

        if (!users?.length) throw new SystemError(">>> Cannot found corresponding User to fetch into Context Request && RedisDB Cache <<<");

        return users;
    },

    /**
     ** - Fetching latest multiple Users Instance from Sequelize Database into Redis Database.
     ** @params {Array<string>} args - Can be either following user properties: [id, email, username].
     ** @returns {Promise<void>}
     **/
    async refreshRedisCachedUsers(this: IContext, ...args: Array<string>): Promise<void> {
        /** When an instance of Transaction appear, make sure ``${this.reload();}`` run after Transaction has been Committed !*/
        if (![ROLE.MANAGER, ROLE.OPERATOR].includes(this.user.role.name)) {
            /** Chỉ [[_MANAGER_]] và [[_OPERATOR_]] được phép trực tiếp thay đổi thông tin của [[_MEMBER_]] khác !*/
            throw new ClientError('Unauthorized', 403);
        }
        /** Get User Redis Client from ``${config/config.default.js}`` !*/
        const userInfoClient = this.app.redis.get('userInfo');

        /** Get latest users directly from MySQL Database !*/
        const users = await this.getManyUsers(...args);

        /** Map Stringified JSON for User Instance to its ``${username}`` before setting to RedisDB !*/
        const userHashMapCached: PlainObject<IUserAttributes['username'], Stringify<IUserAttributes>> = {};

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            /** Set Redis key via username !*/
            userHashMapCached[user.username] = JSON.stringify(user);
        }

        /** @see {@link https://www.npmjs.com/package/ioredis} */
        await userInfoClient.mset(userHashMapCached);
    },

    /**
     ** - Reload new User Instance from Sequelize Database into ``${ctx.user}`` reference.
     ** @side-effects Will trigger Passport [[Login & Logout]] Methods.
     ** @params {boolean} [force] - Whether force reload true, User cached value in Redis will be forced Synchronize.
     ** @params {PlainObject} [options] - Reloading Options with Sequelize Transaction as Hook Dependency.
     ** @returns {Promise<IUserAttributes | void>}
     **/
    async reload<TOptions extends Partial<{
        /** @description * Passing Transaction Instance will set reload execute only after Transaction Committed !*/
        transaction: Transaction;
        /** @description * Passing ``${user.key}`` to refresh user detail information in RedisDB for real-time access !*/
        users: Array<string | 'id' | 'email' | 'username'>;
    }>>(this: IContext, force?: boolean, options?: TOptions): Promise<IUserAttributes | void> {
        /** When an instance of Transaction appear, make sure ``${this.reload();}`` run after Transaction has been Committed !*/
        if (options?.transaction) {
            return options?.transaction?.afterCommit(() => {
                const {transaction, ...rest} = options;
                /** Eliminate Transaction Option to avoid Infinity Recursion !*/
                this.reload(force, {...rest});
            });
        }
        /** CASE 2: Add ``${options.users}`` will only fetching RedisDB without modifying its own Context Instance !*/
        if (options?.users?.length) {
            return this.refreshRedisCachedUsers(...options.users);
        }
        /** Clear User Cached Session !*/
        await this.logout();
        /** Get User using Deserialize Hook inside ``${app.passport.deserializeUser(() => {...user})}`` !*/
        const user = await this.app.passport._handleDeserializeUser(this);
        /** Type Guard in case User has not yet logged in !*/
        if (!user) {
            return void 0;
        }
        /** Get User Redis Client from ``${config/config.default.js}`` !*/
        const userInfoClient = this.app.redis.get('userInfo');
        /** Get corresponding User Fully Detail Information by specific Username from Redis Database !*/
        const userInfo = await userInfoClient.get(user.username);
        /** Set User and corresponding JWT Token from Redis Database !*/
        if (!userInfo || force) {
            /** Pick User directly form MySQL Database to start fetching RedisDB and ``${ctx.user}`` !*/
            const userDetail = await this.getUser({...user});
            if (!userDetail) {
                throw new ClientError("Username không hợp lệ", 400);
            }

            /** Format removing all Nullable Keys from User Context Detail !*/
            const formatUserDetail = this.helper.removeNullableKeyFrom({...userDetail});
            /** Make sure User has been synchronize to Redis Database !*/
            await userInfoClient.set(user.username, JSON.stringify(formatUserDetail));
            /** Load User Instance into Request Context. Hence ``${ctx.user}`` are available !*/
            await this.login(formatUserDetail);

            return ({
                ...formatUserDetail,
            });
        }
        /** Load User Instance into Request Context. Hence ``${ctx.user}`` are available !*/
        await this.login(JSON.parse(userInfo));

        return JSON.parse(userInfo);
    },

    /**
     ** @param {*} value
     ** @example
     ** ctx.print = null;
     ** ctx.print = "Hello";
     ** ctx.print = {name: "Hello"};
     ** ----------------------------------------------------
     ** console.log('check model:', this.app.model); // exist
     ** console.log('check service:', this.service); // exist
     ** console.log('check app service:', this.app.service); // [undefined]
     ** console.log('check controller:', this.app.controller); // exist
     ** console.log('check reference:', this.ctx.app.controller === this.app.controller); // true
     ** @returns {void}
     **/
    set print(value) {

        const body: IBody = {
            data: value !== undefined ? value : null,
            errorCode: 0,
            success: true,
            msg: ERROR_CODE[0],
            errorMsg: "",
        };

        if (isPlainObject(value) && typeof value === "object") {

            if (value.errorCode !== undefined && value.errorCode !== 0) {
                body.errorCode = value.errorCode;
                body.success = false;
                body.msg = ERROR_CODE[body.errorCode] || 'error';
                body.data = null;
            }

            /** Auto Set HTTP Error Instance when Error Message got omitted !*/
            if (value.errorCode && !value.errorMsg) {
                /** In case Error Code got defined within this Application Constant !*/
                if (ERROR_CODE[value.errorCode]) {
                    value.errorMsg = new ClientError(`${ERROR_CODE[value.errorCode]}`);
                } else {
                    value.errorMsg = new HttpError[value.errorCode]();
                }
            }

            /** Override [BODY] Message via thrown HTTP Error Instance exposed as Error Message !*/
            if (value.errorMsg instanceof Error) {
                body.msg = value.errorMsg.message;
            }

            body.msg = value.msg || body.msg;
            body.errorMsg = value.errorMsg || body.msg;

            /**
             ** - Error will be HTTP Error when it was thrown via `ctx.throw()` properly.
             ** @example
             ** ctx.throw(`${code}`, new Error(`${message}`));
             **/
            if (HttpError.isHttpError(value.errorMsg)) {
                /* [[Optional Statements Placeholder]] */
            }

            /** Prevent Application from Exposing Sensitive Errors !*/
            if (!(value.errorMsg instanceof VisibleError) || (value.errorMsg instanceof NonExposeError)) {
                delete body.errorMsg;
                delete body.msg;
            }

            /** Delete duplicate Defined Error fields !*/
            if (isPlainObject(body.data) && typeof body.data === "object") {
                body.data = Object.assign({}, body.data);
                delete body.data.errorCode;
                delete body.data.msg;
                delete body.data.success;
            }
        }

        this.body = body;
    },

};

module.exports = __Context__;
