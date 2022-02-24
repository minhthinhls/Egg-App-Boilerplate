'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {ROLE} from "@/constants";

export default class AccountController extends BaseController {

    async index() {
        const {ctx, service} = this;

        this.validate({
            uid: {type: 'string?', default: ''},
            bankerId: {type: 'string?', default: ''},
            priceId: {type: 'string?', default: ''},
            status: {type: 'string?'},
            accountUsername: {type: 'string?'},
        });

        const {pageNo, pageSize} = ctx.params;

        return this.catch(async () => {
            return service.account.findAndCountAll({
                ...ctx.helper.extractPagingProps({pageSize, pageNo}),
                ...ctx.params.permit('uid', 'bankerId', 'priceId', 'status', 'accountUsername', 'startDate', 'endDate'),
            });
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 2,
        });
    }

    /**
     ** Use only in user's account summary page.
     ** Display open account by banker.
     **/
    async summary() {
        const {ctx, service} = this;

        return this.catch(async () => {
            return service.account.summaryByUid(ctx.user.id);
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 2,
        });
    }

    async getByStatus() {
        const {ctx, service} = this;

        this.validate({
            uid: {type: 'string?', default: ''},
            status: {type: 'string?'},
            pageNo: {type: 'int?', convertType: 'int', default: 0},
            pageSize: {type: 'int?', convertType: 'int', default: 10},
            startDate: {type: 'date?'},
            endDate: {type: 'date?'},
        });

        return this.catch(async () => {
            if (ctx.user.role.name !== ROLE.MEMBER) {
                this.ThrowErrorInstance(RangeError, "Currently not support OPERATOR & MANAGER");
            }
            return service.account.findAllByStatus(ctx.params.status);
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 2,
        });
    }

    async getHistory() {
        const {ctx, service} = this;

        this.validate({
            uid: {type: 'string?', default: ''},
            bankerId: {type: 'string?', default: ''},
            priceId: {type: 'string?', default: ''},
            status: {type: 'string?'},
            accountUsername: {type: 'string?'},
            updatedBy: {type: 'string?', default: ''},
        });

        if (ctx.user.role.name === ROLE.MEMBER && ctx.query.uid && (ctx.user.id !== ctx.query.uid)) {
            return this.response({
                errorCode: 400,
                msg: "Quyền truy cập không hợp lệ",
                errorMsg: new Error("You have no power here"),
            });
        }

        const {pageNo, pageSize} = ctx.params;

        const filters = {
            bankerId: ctx.params.bankerId,
            status: ctx.params.status,
        };

        return this.catch(async () => {
            if (ctx.user.role.name === ROLE.MEMBER) {
                return service.account.findAndCountAllHistory({
                    uid: ctx.user.id,
                    ...ctx.params.permit('startDate', 'endDate'),
                    ...ctx.helper.extractPagingProps({pageSize, pageNo}),
                    ...filters,
                });
            } else {
                return service.account.findAndCountAllHistory({
                    ...ctx.helper.extractPagingProps({pageSize, pageNo}),
                    ...ctx.params.permit('uid', 'bankerId', 'status', 'accountUsername', 'updatedBy', 'startDate', 'endDate'),
                });
            }
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 2,
        });
    }

    /**
     ** Change status of Bet Account
     ** This is used for only [MANAGER, OPERATOR]
     **/
    async updateStatus() {
        const {ctx, service} = this;

        this.validate({
            accountId: {type: 'string'},
            status: {type: 'string'},
            message: {type: 'string'}
        });

        return this.catch(async () => {
            const {accountId, status, message} = ctx.request.body;
            return service.account.updateStatus(accountId, status, message);
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 5,
            rethrow: true,
        });
    }

}

module.exports = AccountController;
