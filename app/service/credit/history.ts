'use strict';

import {BaseService} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {/*ROLE*/} from "@/constants";

/** Sequelize Basic QUERY Options [TRANSACTION & LOCKER] INTERFACES !*/
import type {FindAndCountOptions} from "sequelize/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/credit/history";

export default class CreditHistoryService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.Credit.History;
    }

    /**
     ** - Find and count all log credit
     ** @param {Object} options
     **/
    async findAndCountAll<TOptions extends {
        uid: string;
    } & Partial<{
        startDate: string;
        endDate: string;
    }>>(options: TOptions & FindAndCountOptions<IAttributes>) {
        const {ctx, app} = this;
        return ctx.model.Credit.History.findAndCountAll({
            where: ctx.helper.removeNullableKeyFrom({
                /** TODO: CHECK HERE IF CTX.OP.AND got OMITTED from Query Options ?*/
                [ctx.Op.and]: [
                    options.endDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('credit_history.created_at')),
                        '<=',
                        options.endDate,
                    ) : null,
                    options.startDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('credit_history.created_at')),
                        '>=',
                        options.startDate,
                    ) : null,
                ].filter(ctx.helper.NonNullableOrUndefined),
                uid: options.uid,
            }),
            include: [{
                model: ctx.model.User,
                as: 'user',
                attributes: ['id', 'username', 'fullName'],
            }, {
                model: ctx.model.User,
                as: 'changedBy',
                attributes: ["id", "username"],
            }],
            order: [
                ['createdAt', 'DESC'],
            ],
            nest: true,
            ...options,
        });
    }
}

/** For ES5 Default Import Statement !*/
module.exports.default = CreditHistoryService;
