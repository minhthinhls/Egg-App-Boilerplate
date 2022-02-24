'use strict';

import {BaseService} from "@/extend/class";

/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/banker_product";
/** Sequelize INCREMENT & DECREMENT OPTION INTERFACES !*/
import type {/*IncrementDecrementOptions, IncrementDecrementOptionsWithBy*/} from "sequelize/types/lib/model";

export default class BankerProductService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.BankerProduct;
    }

    /**
     ** - Get list of Banker_Product by its commission range
     ** @param {string} fromDate
     ** @param {string} [toDate]
     ** @returns {Promise<*>}
     **/
    async findByCommissionRange(fromDate: string, toDate: string) {
        const {ctx, app} = this;
        ctx.throw(404, new EvalError("Not Implemented Method! Do not use this Function"));
        return ctx.model.BankerProduct.findAndCountAll({
            where: {
                [ctx.Op.and]: [
                    app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('transfer_log.created_at')),
                        '>=',
                        fromDate
                    ),
                    app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('transfer_log.created_at')),
                        '<=',
                        toDate
                    ),
                ],
            },
            raw: true,
        });
    }

    /**
     ** - Delete Banker_Product
     ** @param {ICreationAttributes} bankerProduct
     ** @returns {Promise}
     **/
    async destroy(bankerProduct: ICreationAttributes) {
        const {ctx} = this;
        return ctx.model.BankerProduct.destroy({
            where: bankerProduct
        });
    }

    /**
     ** - Update Banker_Product
     ** @param {Partial<IAttributes>} bankerProduct - The update data sent from client
     ** @returns {Promise}
     ** @ts-ignore ~!*/
    async update(bankerProduct: Partial<IAttributes> & Pick<IAttributes, 'id'>) {
        const {ctx, app} = this;

        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            const prevLevelState = await this.findByPk(bankerProduct.id, {
                transaction: tx,
                lock: tx.LOCK.UPDATE,
            });
            if (!prevLevelState) {
                throw new Error('Bad request, not found banker to update');
            }

            await Promise.all([
                ctx.model.BankerProduct.update({
                    ...ctx.helper.removeNullableKeyFrom(bankerProduct),
                }, {
                    where: {
                        id: bankerProduct.id,
                    },
                    individualHooks: true,
                    transaction: tx,
                })
            ]);

            return this.findByPk(bankerProduct.id, {transaction: tx});
        });
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = BankerProductService;
