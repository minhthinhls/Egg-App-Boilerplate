'use strict';

import {BaseService} from "@/extend/class";

/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/product";
/** Sequelize INCREMENT & DECREMENT OPTION INTERFACES !*/
import type {/*IncrementDecrementOptions, IncrementDecrementOptionsWithBy*/} from "sequelize/types/lib/model";

export default class ProductService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.Product;
    }

    /**
     ** - Get Product by its name
     ** @param {string} name
     ** @returns {Promise<*>}
     **/
    async findByName(name: IAttributes["name"]) {
        const {ctx} = this;
        return ctx.model.Product.findOne({
            rejectOnEmpty: true,
            where: {
                name: name,
            },
            raw: true,
        });
    }

    /**
     ** - Update Products
     ** @param {Partial<IAttributes> & Pick<IAttributes, 'id'>} product - The update data sent from client
     ** @returns {Promise}
     ** @ts-ignore ~!*/
    async update(product: Partial<IAttributes> & Pick<IAttributes, 'id'>) {
        const {ctx, app} = this;

        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            const prevLevelState = await this.findByPk(product.id, {
                transaction: tx,
                lock: tx.LOCK.UPDATE,
            });
            if (!prevLevelState) {
                throw new Error('Bad request, not found banker to update');
            }

            await Promise.all([
                ctx.model.Product.update({
                    ...ctx.helper.removeNullableKeyFrom(product),
                }, {
                    where: {
                        id: product.id,
                    },
                    individualHooks: true,
                    transaction: tx,
                }),
            ]);

            return this.findByPk(product.id, {
                transaction: tx,
            });
        });
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = ProductService;
