'use strict';

import {BaseService} from "@/extend/class";
/** Sequelize Basic QUERY Options [TRANSACTION & LOCKER] INTERFACES !*/
import type {WhereOptions, FindAndCountOptions} from "sequelize/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/request/message";

export default class RequestMessageService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.Request.Message;
    }

    /**
     ** - Retrieve a certain logger message from user request, support paging query
     ** @param {string} requestId
     ** @param {WhereOptions<IAttributes>} [where]
     ** @param {FindAndCountOptions<IAttributes>} [options]
     ** @returns {Promise}
     **/
    async findAllByRequestId(requestId: string, where?: WhereOptions<IAttributes>, options?: FindAndCountOptions<IAttributes>) {
        const {ctx} = this;
        const queries = ctx.helper.removeNullableKeyFrom({...where});

        if (Number.isNaN(options?.offset) || !options?.limit) {
            delete options?.offset;
            delete options?.limit;
        } else {
            options.offset = (options.offset || 1) * options.limit;
        }

        return ctx.model.Request.Message.findAndCountAll({
            where: {
                requestId: requestId,
                ...queries
            },
            raw: true,
            order: [['createdAt', 'DESC']],
            ...options
        });
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = RequestMessageService;
