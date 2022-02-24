'use strict';

import {BaseService} from "@/extend/class";

/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/user/level/log";
/** Sequelize Basic QUERY Options [TRANSACTION & LOCKER] INTERFACES !*/
import type {FindOptions} from "sequelize/types";
/** Sequelize TRANSACTION & LOCKER INTERFACES !*/
import type {/*Transaction, LOCK*/} from "sequelize/types/lib/transaction";
/** Sequelize INCREMENT & DECREMENT OPTION INTERFACES !*/
import type {/*IncrementDecrementOptions, IncrementDecrementOptionsWithBy*/} from "sequelize/types/lib/model";

export default class LogUserLevelService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.User.Level.Log;
    }

    /**
     ** - Get current level of user
     ** @param {string} uid
     ** @param {FindOptions<IAttributes>} [options]
     **/
    async getCurrentUserLevel(uid: string, options?: FindOptions<IAttributes>) {
        const {ctx} = this;
        const [latestLogUserLevel] = await ctx.model.User.Level.Log.findAll({
            limit: 1,
            where: {uid},
            include: ['level'],
            order: [['createdAt', 'DESC']],
            ...options,
        });

        if (latestLogUserLevel) {
            return latestLogUserLevel.level;
        }

        /** User has no level information !*/
        return ctx.throw(404, new ClientError("User has no level information"));
    }

    /**
     ** - Get latest user's level at specific time (before this time)
     ** @param {string} uid
     ** @param {Date} date
     **/
    async getUserLogLevelAtSpecificTime(uid: string, date: Date) {
        const {ctx} = this;

        const rows = await ctx.model.User.Level.Log.findAll({
            limit: 1,
            where: {
                uid: uid,
                createdAt: {
                    [ctx.Op.lt]: date,
                }
            },
            include: [{
                model: ctx.model.User.Level,
                as: 'level',
            }],
            raw: true,
            nest: true,
            order: [['createdAt', 'DESC']],
        });

        const logUserLevelInfo = rows[0];
        if (logUserLevelInfo) {
            return {
                ...logUserLevelInfo.level,
                uid: logUserLevelInfo.uid,
                createdAt: logUserLevelInfo.createdAt,
                updatedAt: logUserLevelInfo.updatedAt,
            };
        }

        return null;
    }
}

/** For ES5 Default Import Statement !*/
module.exports.default = LogUserLevelService;
