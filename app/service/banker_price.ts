'use strict';

import {BaseService} from "@/extend/class";

/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/banker_price";
/** Sequelize INCREMENT & DECREMENT OPTION INTERFACES !*/
import type {/*IncrementDecrementOptions, IncrementDecrementOptionsWithBy*/} from "sequelize/types/lib/model";

export default class BankerPriceService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.BankerPrice;
    }

    /**
     ** - Delete Banker_Price
     ** @param {ICreationAttributes} bankerPrice
     ** @returns {Promise}
     **/
    async destroy(bankerPrice: ICreationAttributes) {
        const {ctx} = this;
        return ctx.model.BankerPrice.destroy({
            where: bankerPrice,
        });
    }

    /**
     ** - Update Banker_Price
     ** @param {Partial<IAttributes>} bankerPrice - The update data sent from client
     ** @returns {Promise}
     ** @ts-ignore ~!*/
    async update(bankerPrice: Partial<IAttributes> & Pick<IAttributes, 'id'>) {
        const {app, ctx} = this;

        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            const prevLevelState = await this.findByPk(bankerPrice.id, {
                transaction: tx,
                lock: tx.LOCK.UPDATE,
            });
            if (!prevLevelState) {
                throw new Error('Bad request, not found banker to update');
            }

            await Promise.all([
                ctx.model.BankerPrice.update({
                    ...ctx.helper.removeNullableKeyFrom(bankerPrice),
                }, {
                    where: {
                        id: bankerPrice.id,
                    },
                    individualHooks: true,
                    transaction: tx,
                })
            ]);

            return this.findByPk(bankerPrice.id, {transaction: tx});
        });
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = BankerPriceService;
