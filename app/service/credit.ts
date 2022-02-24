'use strict';

import {BaseService} from "@/extend/class";

/** Import User Credit History Service !*/
import CreditHistoryService from "@/service/credit/history";

/** Import Pre-Defined Types Helper !*/
import type {PlainObject} from "@/extend/types";
/** Customized Context Params for Sequelize Options !*/
import type {IContextOptions} from "@/extend/types";
/** Sequelize Basic QUERY Options [TRANSACTION & LOCKER] INTERFACES !*/
import type {FindOptions, CreateOptions} from "sequelize/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/credit";
/** Sequelize TRANSACTION & LOCKER INTERFACES !*/
import type {/*Transaction, LOCK*/} from "sequelize/types/lib/transaction";
/** Sequelize INCREMENT & DECREMENT OPTION INTERFACES !*/
import type {/*IncrementDecrementOptions, IncrementDecrementOptionsWithBy*/} from "sequelize/types/lib/model";

export default class CreditService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.Credit;
        BaseService.safeLazyPropertyInject(this, 'history', CreditHistoryService);
    }

    /**
     ** - Get Specified User Credit Row.
     ** @param {string} uid
     ** @param {FindOptions<IAttributes>} [options]
     ** @returns {Promise}
     **/
    async getAvailableCredit(uid: string, options?: FindOptions<IAttributes>) {
        const {ctx} = this;
        const userCredit = await this.findOneByUid(uid);
        if (!userCredit) {
            throw new ReferenceError("Cannot found User Credit according to their Unique ID");
        }
        /** TODO: Version2 sẽ chuyển Credit info vào cache RedisDB để sử dụng dưới dạng ``${ctx.user.credit}``. Giảm tải cho database !*/

        const pendingCredit = await ctx.model.Credit.Pending.findAll({
            where: {
                creditId: userCredit.id,
            },
            raw: true,
            ...options,
        });

        const freeze = pendingCredit.reduce((prev, curr) => prev + curr.amount, 0);
        return {
            balance: userCredit.balance,
            availableBalance: userCredit.balance - freeze,
            freeze: freeze,
            debt: ctx.user.credit.debt,
        };
    }

    /**
     ** @param {string} uid
     ** @param {CreateOptions<IAttributes>} [options]
     ** @ts-ignore ~!*/
    async create(uid: string, options?: CreateOptions<IAttributes>) {
        const {ctx} = this;
        uid = uid || ctx.user.id;
        const data = {balance: 0, freeze: 0, debt: 0};
        return ctx.model.Credit.create({uid, ...data}, {...options});
    }

    /**
     ** @see {@link https://stackoverflow.com/questions/48778789/addition-and-subtraction-assignment-operator-with-sequelize}
     ** @param {{balance?: number, freeze?: number, debt?: number}} data
     ** @param {Object} queries
     ** @param {Object} options
     ** @returns {Promise<*>}
     ** @ts-ignore ~!*/
    async update<TOptions extends Omit<FindOptions<IAttributes>, 'raw' | 'lock'>>(
        data: Partial<IAttributes>,
        queries: PlainObject,
        options: TOptions & IContextOptions,
    ) {
        /* Get current user credit state */
        const userCredit = await this.ctx.model.Credit.findOne({
            rejectOnEmpty: true,
            where: {
                uid: queries.uid,
            },
            raw: false,
            lock: options.transaction?.LOCK.UPDATE,
            transaction: options.transaction,
            ...options,
        });

        const {balance = 0, freeze = 0, debt = 0} = data;
        const updateFields = {
            balance: userCredit.balance + balance,
            freeze: userCredit.freeze + freeze,
            debt: userCredit.debt + debt,
        };

        return userCredit.update({...updateFields}, {
            where: queries,
            transaction: options.transaction,
            individualHooks: true,
            user: options.user,
            credit: {
                ...options.credit,
                /** The amount of balance change from current action !*/
                change: balance,
            },
            message: options.message,
        });
    }
}

/** For ES5 Default Import Statement !*/
module.exports.default = CreditService;
