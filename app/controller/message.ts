'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {ROLE} from "@/constants";

export default class MessageController extends BaseController {
    async index() {
        const {ctx, service} = this;

        const {pageNo = 0, pageSize = 20, types = undefined} = ctx.query;

        this.validate({
            uid: {type: 'string?'},
            sentBy: {type: 'string?'},
            types: {type: 'string?'},
        });

        const result = await service.message.findAndCountAllById({
            ...ctx.helper.extractPagingProps({pageSize, pageNo}),
            ...ctx.params.permit('startDate', 'endDate'),
            uid: (ctx.user.role.name === ROLE.MEMBER) ? ctx.user.id : ctx.query?.uid,
            types: types?.split(","),
            sentBy: ctx.query?.sentBy,
        });
        return this.response(result);
    }

    async create() {
        const {ctx, service} = this;

        this.validate({
            title: {type: 'string'},
            content: {type: 'string'},
            uid: {type: 'string'},
        });

        return this.catch(async () => {
            const result = await service.message.create({
                sentBy: ctx.user.id,
                ...ctx.request.body,
            });
            return {
                data: result,
                msg: 'Created Successfully',
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 3,
        });
    }

    async markAsRead() {
        const {ctx, service} = this;

        await service.message.updateUnRead(ctx.params.id);
        ctx.print = {msg: 'Marked as read'};
    }

    async update() {
        const {ctx, service} = this;

        this.validate({
            title: {type: 'string'},
            content: {type: 'string'},
        });

        return this.catch(async () => {
            const result = await service.message.updateOne(ctx.params.id, {
                hasRead: false,
                ...ctx.params.permit('title', 'content'),
            });
            return {
                data: result,
                msg: 'Updated Successfully',
            };
        }, {
            errorCode: 3,
        });
    }

    async deleteById() {
        const {ctx, service} = this;

        return this.catch(async () => {
            const result = await service.message.deleteById(ctx.params.id);
            return {
                data: result,
                msg: 'Deleted Successfully',
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 3,
        });
    }

}

module.exports = MessageController;
