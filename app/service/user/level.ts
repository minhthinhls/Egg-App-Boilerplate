'use strict';

import {BaseService} from "@/extend/class";

/** Import User Level Logger Service !*/
import UserLevelLogService from "@/service/user/level/log";

/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/user/level";
/** Sequelize Basic QUERY Options [TRANSACTION & LOCKER] INTERFACES !*/
import type {/*WhereOptions, FindOptions*/} from "sequelize/types";
/** Sequelize TRANSACTION & LOCKER INTERFACES !*/
import type {/*Transaction, LOCK*/} from "sequelize/types/lib/transaction";
/** Sequelize INCREMENT & DECREMENT OPTION INTERFACES !*/
import type {/*IncrementDecrementOptions, IncrementDecrementOptionsWithBy*/} from "sequelize/types/lib/model";

export default class LevelService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.User.Level;
        BaseService.safeLazyPropertyInject(this, 'log', UserLevelLogService);
    }

    /**
     ** - Get level by its name
     ** @param {string} name
     ** @returns {Promise<*>}
     **/
    async findByName(name: string) {
        const {ctx} = this;
        return ctx.model.User.Level.findOne({
            rejectOnEmpty: true,
            where: {
                name: name,
            },
            raw: true,
        });
    }

    /**
     ** - Update Level
     ** @param {Partial<IAttributes>} level - The update data sent from client
     ** @returns {Promise<*>}
     ** @ts-ignore ~!*/
    async update(level: Pick<IAttributes, 'id'> & Partial<IAttributes>) {
        const {ctx, app} = this;

        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        // eslint-disable-next-line complexity
        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            const prevLevelState = await this.findByPk(level.id, {
                transaction: tx,
                lock: tx.LOCK.UPDATE,
            });
            if (!prevLevelState) {
                throw new Error('Bad request, not found level to update');
            }

            await Promise.all([
                ctx.model.User.Level.update({
                    name: level.name,
                    cumulativeDeposit: level.cumulativeDeposit,
                    percentRefund: level.percentRefund,
                }, {
                    where: {
                        id: level.id,
                    },
                    individualHooks: true,
                    transaction: tx,
                    /* Passing "user" to option for write log purpose */
                    /* user: ctx.user, */
                    /* Not supported */
                    /* returning: true, */
                })
            ]);

            return this.findByPk(level.id, {transaction: tx});
        });
    }

    /**
     ** - Get lowest level, base on cumulative deposit amount
     **/
    async findLowestLevel() {
        const {ctx} = this;
        const [lowestLevel] = await ctx.model.User.Level.findAll({
            limit: 1,
            order: [
                ['cumulativeDeposit', 'ASC']
            ]
        });
        if (!lowestLevel) {
            return Promise.reject('Not found default level');
        }

        return lowestLevel;
    }

    /**
     ** - Return highest suitable level base on cumulative deposit that user has transferred into bet account
     ** @param {number} cumulativeDeposit
     **/
    async findHighestSuitableLevel(cumulativeDeposit: number) {
        const {ctx} = this;
        const [highestSuitableLevel] = await ctx.model.User.Level.findAll({
            limit: 1,
            where: {
                cumulativeDeposit: {
                    [ctx.Op.lte]: cumulativeDeposit,
                },
            },
            order: [
                ['cumulativeDeposit', 'DESC'],
            ],
        });

        return highestSuitableLevel;
    }
}

/** For ES5 Default Import Statement !*/
module.exports.default = LevelService;
