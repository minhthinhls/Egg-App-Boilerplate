'use strict';

import {BaseService} from "@/extend/class";

/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/banker";
/** Sequelize Basic QUERY Options [TRANSACTION & LOCKER] INTERFACES !*/
import type {FindAndCountOptions} from "sequelize/types";
/** Sequelize TRANSACTION & LOCKER INTERFACES !*/
import type {/*Transaction, LOCK*/} from "sequelize/types/lib/transaction";
/** Sequelize INCREMENT & DECREMENT OPTION INTERFACES !*/
import type {/*IncrementDecrementOptions, IncrementDecrementOptionsWithBy*/} from "sequelize/types/lib/model";

export default class BankerService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.Banker;
    }

    /**
     ** - Get banker by its name
     ** @param {string} name
     ** @returns {Promise<*>}
     **/
    async findByName(name: string) {
        const {ctx} = this;
        return ctx.model.Banker.findOne({
            rejectOnEmpty: true,
            where: {
                name: name,
            },
            raw: true,
        });
    }

    /**
     ** - Update Banker
     ** @param {Object} banker - The update data sent from client
     ** @returns {Promise<*>}
     ** @ts-ignore ~!*/
    async update(banker: any) {
        const {ctx, app} = this;

        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            const prevLevelState = await this.findByPk(banker.id, {
                transaction: tx,
                lock: tx.LOCK.UPDATE,
                rejectOnEmpty: true,
            });
            if (!prevLevelState) {
                throw new Error('Bad request, not found banker to update');
            }

            await Promise.all([
                ctx.model.Banker.update({
                    name: banker.name,
                    shortName: banker.shortName,
                    website: banker.website,
                    min: banker.min,
                    max: banker.max,
                    posterUrl: banker.posterUrl,
                    bookType: banker.bookType,
                }, {
                    where: {
                        id: banker.id,
                    },
                    individualHooks: true,
                    transaction: tx,
                })
            ]);

            return this.findByPk(banker.id, {transaction: tx});
        });
    }

    /**
     ** @param {FindAndCountOptions<IAttributes>} [options]
     ** @returns {Promise}
     ** @ts-ignore ~!*/
    async findAndCountAll(options?: FindAndCountOptions<IAttributes>) {
        const {ctx} = this;

        return ctx.model.Banker.findAndCountAll({
            where: {},
            order: [
                ['name', 'ASC'],
                /** @see {@link https://stackoverflow.com/questions/29995116/ordering-results-of-eager-loaded-nested-models-in-node-sequelize} */
                [{model: ctx.model.Price, as: 'prices'}, 'exchangeRate', 'DESC'],
            ],
            include: [{
                model: ctx.model.Product,
                as: 'products',
                attributes: ['id', 'name'],
                through: {
                    as: 'bankerProduct',
                    attributes: ['id', 'constants'],
                },
            }, {
                model: ctx.model.Price,
                as: 'prices',
                attributes: ['id', 'name', 'exchangeRate'],
                through: {
                    as: 'bankerPrice',
                    attributes: ['id'],
                },
            }],
            nest: true,
            ...options
        });
    }
}

/** For ES5 Default Import Statement !*/
module.exports.default = BankerService;
