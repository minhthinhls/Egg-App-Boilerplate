'use strict';

import {BaseService} from "@/extend/class";

/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/currency";
/** Sequelize QUERIES OPTION INTERFACES !*/
import type {/*WhereOptions, FindOptions*/} from "sequelize/types";
/** Sequelize TRANSACTION & LOCKER INTERFACES !*/
import type {/*Transaction, LOCK*/} from "sequelize/types/lib/transaction";
/** Sequelize INCREMENT & DECREMENT OPTION INTERFACES !*/
import type {/*IncrementDecrementOptions, IncrementDecrementOptionsWithBy*/} from "sequelize/types/lib/model";

export default class CurrencyService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.Currency;
    }

    /**
     ** - Get currency by its name
     ** @param {string} name
     ** @returns {Promise<*>}
     **/
    async findByName(name: string) {
        const {ctx} = this;
        return ctx.model.Currency.findOne({
            rejectOnEmpty: true,
            where: {
                name: name,
            },
            raw: true,
        });
    }

    /**
     ** @param {ICreationAttributes} currency
     ** @returns {[Promise<*>]}
     ** @ts-ignore !*/
    async create(currency: ICreationAttributes) {
        const {ctx} = this;
        return Promise.all([
            ctx.model.Currency.create({
                name: currency.name,
                exchangeRate: currency.exchangeRate,
                buyPrice: currency.buyPrice,
                sellPrice: currency.sellPrice,
            }),
        ]);
    }

    /**
     ** - Update Currency exchange rate.
     ** @param {Partial<IAttributes & Pick<IAttributes, 'id'>>} currency - The update data sent from client
     ** @returns {Promise}
     ** @ts-ignore ~!*/
    async update(currency: Partial<IAttributes> & Pick<IAttributes, 'id'> & {disabledCrawling?: boolean}) {
        const {ctx, app} = this;

        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            const prevCurrencyState = await this.findByPk(currency.id, {
                transaction: tx,
                lock: tx.LOCK.UPDATE,
            });
            if (!prevCurrencyState) {
                throw new EvalError('Bad request, not found currency to update');
            }

            await Promise.all([
                ctx.model.Currency.update({
                    name: currency.name,
                    exchangeRate: currency.exchangeRate,
                    buyPrice: currency.buyPrice,
                    sellPrice: currency.sellPrice,
                }, {
                    where: {
                        id: currency.id,
                    },
                    individualHooks: true,
                    transaction: tx,
                    /* Passing "user" to option for logging purpose !*/
                    /* user: ctx.user, */
                    /* Not supported !*/
                    /* returning: true, */
                }),
            ]);

            return this.findByPk(currency.id, {
                transaction: tx,
            });
        });
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = CurrencyService;
