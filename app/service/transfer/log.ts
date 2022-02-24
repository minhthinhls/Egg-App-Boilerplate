'use strict';

import {BaseService} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {APPROVE_STATUS, REQUEST_TYPE} from "@/constants";
/** Sequelize Basic QUERY Options [TRANSACTION & LOCKER] INTERFACES !*/
import type {AggregateOptions, DataType, FindAndCountOptions} from "sequelize/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/transfer/log";

export default class TransferLogService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.Transfer.Log;
    }

    /**
     * Find and count all log transfer
     * @param options
     */
    async findAndCountAll<TOptions extends {
        uid: string;
        accountId: string;
        accountUsername: string;
    } & Partial<{
        startDate: string;
        endDate: string;
    }>>(options: TOptions & FindAndCountOptions<IAttributes>) {
        const {ctx, app} = this;

        return ctx.model.Transfer.Log.findAndCountAll({
            where: ctx.helper.removeNullableKeyFrom({
                /** TODO: CHECK HERE IF [[CTX.OP.AND]] got OMITTED from Query Options ?*/
                [ctx.Op.and]: [
                    options.endDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('transfer_log.created_at')),
                        '<=',
                        options.endDate
                    ) : null,
                    options.startDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('transfer_log.created_at')),
                        '>=',
                        options.startDate
                    ) : null,
                ].filter(Boolean),
                uid: options.uid,
                accountId: options.accountId,
            }),
            include: [{
                model: ctx.model.User,
                as: 'user',
                attributes: ['id', 'username', 'fullName'],
            }, {
                model: ctx.model.User,
                as: 'approvedByUser',
                attributes: ['id', 'username', 'fullName'],
            }, {
                model: ctx.model.Account,
                as: 'account',
                attributes: ['username'],
                where: ctx.helper.removeNullableKeyFrom({
                    username: options.accountUsername,
                }),
                include: [{
                    model: ctx.model.Banker,
                    attributes: ['name'],
                    as: 'banker',
                }],
            }],
            order: [
                ['createdAt', 'DESC'],
            ],
            nest: true,
            ...options,
        });
    }

    /**
     ** - Return the total amount that user has transferred into bet account, in VNĐ
     ** @param {string} uid
     ** @param {AggregateOptions<DataType>} [options]
     **/
    async sumTransferInByUid(uid: string, options?: AggregateOptions<DataType>) {
        const {ctx} = this;

        return ctx.model.Transfer.Log.sum('balance', {
            where: {
                uid: uid,
                type: REQUEST_TYPE.TRANSFER_IN,
                approveStatus: APPROVE_STATUS.APPROVED,
            },
            ...options,
        });
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = TransferLogService;
