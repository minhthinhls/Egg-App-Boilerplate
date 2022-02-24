'use strict';

import {BaseService} from "@/extend/class";

/** Import ES6 Default Dependencies !*/
import {markdown as Markdown} from "js-ant";
/** Import ENUMS & CONSTANTS !*/
import {ROLE, MESSAGE_TITLE} from "@/constants";

/** Import Deep Nested Models Attributes Defined Types !*/
import type {/*IModelDeepAttributes*/} from "@/extend/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/message";
/** Sequelize Basic QUERY Options [TRANSACTION & LOCKER] INTERFACES !*/
import type {FindAndCountOptions} from "sequelize/types";

export default class MessageService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.Message;
    }

    /**
     ** @param {FindAndCountOptions<IAttributes>} [options]
     ** @returns {Promise}
     **/
    async findAndCountAllById<TExtraOptions extends Partial<{
        types: Array<string>;
        uid: string;
        sentBy: string;
        endDate: string;
        startDate: string;
    }>>(options?: TExtraOptions & FindAndCountOptions<IAttributes>) {
        const {ctx, app} = this;
        let whereCondition = {};
        if (!options?.types?.length) {
            let sentByCond = options?.sentBy as any;
            if (ctx.user.role.name !== ROLE.MEMBER && !options?.sentBy && ctx.user.id !== options?.uid) {
                sentByCond = {[ctx.Op.ne]: null};
            }
            whereCondition = {
                [ctx.Op.and]: [
                    options?.endDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('message.created_at')),
                        '<=',
                        options.endDate
                    ) : null,
                    options?.startDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('message.created_at')),
                        '>=',
                        options.startDate
                    ) : null,
                ].filter(ctx.helper.NonNullableOrUndefined),
                ...ctx.helper.removeNullableKeyFrom({
                    uid: options?.uid,
                    sentBy: sentByCond,
                }),
            };
        }
        if (options?.types?.length && options?.types?.includes("OTHER")) {
            whereCondition = {
                uid: ctx.user.id,
                [ctx.Op.or]: [{
                    requestId: {[ctx.Op.is]: undefined},
                }, {
                    "$request.type$": {[ctx.Op.in]: options.types},
                }],
            };
        }
        if (options?.types?.length && !options?.types?.includes("OTHER")) {
            whereCondition = {
                uid: ctx.user.id,
                "$request.type$": {
                    [ctx.Op.in]: options?.types,
                }
            };
        }

        const {count, rows} = await ctx.model.Message.findAndCountAll({
            include: [{
                model: ctx.model.Request,
                as: 'request',
                attributes: ['id', 'type'],
            }, {
                model: ctx.model.User,
                as: 'sentByUser',
                attributes: ['id', 'username'],
            }, {
                model: ctx.model.User,
                as: 'user',
                attributes: ['id', 'username'],
            }],
            where: whereCondition,
            order: [
                ['createdAt', 'DESC']
            ],
            ...options,
            nest: true,
            raw: true,
        });

        return {
            count: count,
            rows: rows.map((msg) => {
                msg.title = msg.title || MESSAGE_TITLE[msg.type];
                msg.html = Markdown.render(msg.content);
                return msg;
            }),
        };
    }

    /**
     ** @param {string} id
     ** @returns {Promise}
     **/
    async deleteById(id: string) {
        const {ctx} = this;
        return ctx.model.Message.destroy({
            where: {
                id: id,
            },
        });
    }

    /**
     ** @param {string} id
     ** @param {Object} params
     ** @returns {Promise}
     **/
    async updateOne(id: string, params: object) {
        const {ctx} = this;
        await ctx.model.Message.update({
            ...ctx.helper.removeNullableKeyFrom(params),
        }, {
            where: {
                id: id,
            },
        });

        return ctx.model.Message.findByPk(id);
    }

    /**
     ** @param {string | Array<string>} id
     ** @returns {Promise}
     **/
    async updateUnRead(id: string | `${string},${string}` | Array<string> | 'all') {
        const {ctx} = this;

        if (typeof id === "string" && id.toLocaleLowerCase() === 'all') {
            return ctx.model.Message.update({
                hasRead: true,
            }, {
                where: {
                    uid: ctx.user.id,
                },
            });
        }

        return ctx.model.Message.update({
            hasRead: true,
        }, {
            where: {
                id: {[ctx.Op.in]: Array.isArray(id) ? id : id.split(', ')},
                uid: ctx.user.id,
            },
        });
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = MessageService;
