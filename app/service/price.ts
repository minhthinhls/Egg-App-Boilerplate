'use strict';

import {BaseService} from "@/extend/class";

/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/price";
/** Sequelize TRANSACTION & LOCKER INTERFACES !*/
import type {/*Transaction, LOCK*/} from "sequelize/types/lib/transaction";
/** Sequelize INCREMENT & DECREMENT OPTION INTERFACES !*/
import type {/*IncrementDecrementOptions, IncrementDecrementOptionsWithBy*/} from "sequelize/types/lib/model";

export default class PriceService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.Price;
    }

    /**
     ** - Create new price
     ** @param {ICreationAttributes} price
     ** @returns {Promise}
     **/
    async create<TPrice extends ICreationAttributes>(price: TPrice) {
        const {ctx, app} = this;
        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            return ctx.model.Price.create(price, {transaction: tx});
        });
    }

    /**
     ** - Update price
     ** @param {Partial<IAttributes> & Pick<IAttributes, 'id'>} price - The update data sent from client
     ** @returns {Promise}
     ** @ts-ignore ~!*/
    async update(price: Partial<IAttributes> & Pick<IAttributes, 'id'>) {
        const {ctx, app} = this;

        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            const prevPriceState = await this.findByPk(price.id, {
                transaction: tx,
                lock: tx.LOCK.UPDATE,
            });
            if (!prevPriceState) {
                throw new Error('Bad request, not found row to update');
            }

            await Promise.all([
                ctx.model.Price.update({
                    name: price.name,
                    exchangeRate: price.exchangeRate
                }, {
                    where: {
                        id: price.id,
                    },
                    individualHooks: true,
                    transaction: tx,
                    /* Passing "user" to option for write log purpose !*/
                    /* user: ctx.user, */
                    /* Not supported !*/
                    /* returning: true, */
                }),
            ]);

            return this.findByPk(price.id, {
                transaction: tx,
            });
        });
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = PriceService;
