'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {ROLE, REQUEST_TYPE, REQUEST_STATUS} from "@/constants";

export default class RequestController extends BaseController {

    async index() {
        const {ctx, service} = this;

        this.validate({
            uid: {type: 'string?'},
            status: {type: 'string?'},
            requestId: {type: 'string?'},
            username: {type: 'string?'},
            type: {type: 'string?'},
            code: {type: 'string?'},
        });

        const {uid, pageNo, pageSize, requestId} = ctx.params;

        const filters = ctx.helper.removeNullableKeyFrom({
            requestType: ctx.params.type,
            status: ctx.params.status,
        });

        const isAdmin = [ROLE.MANAGER, ROLE.OPERATOR].includes(ctx.user.role.name);

        return this.catch(async () => {
            return requestId ? await service.request.findOne(requestId, {raw: false})
                : await service.request.findAndCountAll({
                    ...ctx.helper.extractPagingProps({pageSize, pageNo}),
                    ...ctx.params.permit([
                        'startDate', 'endDate',
                        'code', 'username',
                    ]),
                    /** Nếu là quản lý, lấy danh sách yêu cầu & filter. Còn user chỉ lấy đúng User ID decode từ JWT Token !*/
                    uid: isAdmin ? uid : ctx.user.id,
                    ...filters,
                });
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 2,
        });
    }

    async create() {
        const {ctx, service} = this;

        this.validate({
            type: {type: 'RequestType'},
            data: {type: 'object'},
        });

        const {type, data} = ctx.params;

        /** Validate data object ~!*/
        switch (type) {
            case REQUEST_TYPE.DEPOSIT:
                ctx.validate({
                    currencyId: {type: 'string'},
                    currencyName: {type: 'string'},
                    exchangeRate: {type: 'number'},
                    amount: {type: 'Amount'},
                    balance: {type: 'number'},
                    acceptNewPrice: {type: 'boolean'},
                    /** note: Nội dung giao dịch đối với VnPay, 6 số cuối mã giao dịch đối với tiền ảo */
                    note: {type: 'string'},
                    confirmed: [true],
                    /** vnPayDepositId: Yêu cầu đối với top-up bằng VnPay */
                    vnPayDepositId: {type: 'string?'}
                }, data);
                break;
            case REQUEST_TYPE.WITHDRAW:
                ctx.validate({
                    amount: {type: 'Amount'},
                    balance: {type: 'number'},
                    currencyId: {type: 'string'},
                    currencyName: {type: 'string'},
                    exchangeRate: {type: 'number'},
                    virtualWalletId: {type: 'string?'},
                    bankAccountId: {type: 'string?'},
                    isVnpay: {type: 'boolean?'},
                    password: {type: 'string'},
                    note: {type: 'string?'},
                    acceptNewPrice: {type: 'boolean'},
                }, data);
                break;
            case REQUEST_TYPE.CREATE_ACCOUNT:
                ctx.validate({
                    bankerId: {type: 'string'},
                    priceId: {type: 'string'},
                    priceName: {type: 'string'},
                    exchangeRate: {type: 'number'},
                    amount: {type: 'Amount'},
                    balance: {type: 'number'},
                    min: {type: 'number'},
                    max: {type: 'number'},
                    note: {type: 'string?'},
                    /** Tham số tham gia khuyến mãi Transfer-In */
                    promotionId: {type: 'string?'},
                    // skip: {type: 'boolean?'},
                }, data);
                break;
            case REQUEST_TYPE.TRANSFER_IN:
                ctx.validate({
                    bankerName: {type: 'string'},
                    accountId: {type: 'string'},
                    username: {type: 'string'},
                    exchangeRate: {type: 'number'},
                    amount: {type: 'Amount'},
                    balance: {type: 'number'},
                    note: {type: 'string?'},
                    /** Tham số tham gia khuyến mãi Transfer-In */
                    promotionId: {type: 'string?'},
                    // skip: {type: 'boolean?'},
                }, data);
                break;
            case REQUEST_TYPE.TRANSFER_OUT:
                ctx.validate({
                    bankerName: {type: 'string'},
                    accountId: {type: 'string'},
                    username: {type: 'string'},
                    exchangeRate: {type: 'number'},
                    amount: {type: 'Amount'},
                    balance: {type: 'number'},
                    note: {type: 'string?'},
                }, data);
                break;
            case REQUEST_TYPE.CLOSE_ACCOUNT:
                ctx.validate({
                    bankerId: {type: 'string'},
                    bankerName: {type: 'string'},
                    accountId: {type: 'string'},
                    username: {type: 'string'},
                    exchangeRate: {type: 'number'},
                    note: {type: 'string?'},
                }, data);
                break;
            case REQUEST_TYPE.UPDATE_PROFILE:
                ctx.validate({
                    fullName: {type: 'string?', trim: true},
                    email: {type: 'string?', trim: true},
                    phoneNumber: {type: 'string?', trim: true},
                    dateOfBirth: {type: 'string?', trim: true},
                    ottType: {type: 'string?', trim: true},
                    ottAddress: {type: 'string?', trim: true},
                    password: {type: 'string'},
                }, data);
                break;
            case REQUEST_TYPE.RESET_PASSWORD:
                ctx.validate({
                    bankerId: {type: 'string', trim: true},
                    bankerName: {type: 'string', trim: true},
                    accountId: {type: 'string', trim: true},
                    accountName: {type: 'string', trim: true},
                }, data);
                break;
            default:
                break;
        }

        return this.catch(async () => {
            return service.request.create({
                ...ctx.params,
            });
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 3,
            rethrow: true,
        });
    }

    async update() {
        const {ctx, service} = this;

        this.validate({
            id: {type: 'string'},
            status: {type: 'RequestStatus'},
            title: {type: 'string?'},
            content: {type: 'string?'},
        });

        const uid = ctx.user.id;
        const user = await service.user.findUserByUid(uid);
        if (!user?.role?.name) {
            throw new ReferenceError("Cannot found User Role Name =>");
        }
        const isOperator = [ROLE.MANAGER, ROLE.OPERATOR].includes(user.role.name);

        const {status, title, content} = ctx.params;

        /* Check permission here */
        if (!isOperator && [REQUEST_STATUS.RESOLVED, REQUEST_STATUS.RECEIVED].includes(status)) {
            return this.response({
                errorCode: 403,
                msg: 'Không có quyền'
            });
        }

        /* Check request.body */
        if (isOperator && (!title || !content)) {
            return this.response({
                errorCode: 400,
            });
        }

        return this.catch(async () => {
            return service.request.update(ctx.request.body);
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 5,
            rethrow: isOperator,
        });
    }

    async getWaitingCount() {
        const {service} = this;

        return this.catch(async () => {
            return service.request.getWaitingCount();
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 2,
        });
    }

    async getSummary() {
        const {ctx, service} = this;

        return this.catch(async () => {
            return service.request.getSummary({uid: ctx.user.id});
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 2,
        });
    }

    async getHistory() {
        const {ctx, service} = this;

        this.validate({
            requestId: {type: 'string?', default: ''},
            requestType: {type: 'string?', default: ''},
            updatedBy: {type: 'string?', default: ''},
            requestCode: {type: 'string?'},
            status: {type: 'string?'},
            uid: {type: 'string?'},
        });

        const {pageNo, pageSize} = ctx.params;

        return this.catch(async () => {
            return service.request.findAndCountAllRequestHistory({
                ...ctx.helper.extractPagingProps({pageSize, pageNo}),
                ...ctx.params.permit([
                    'requestId', 'requestType', 'uid', 'updatedBy',
                    'startDate', 'endDate', 'status', 'requestCode',
                ]),
            });
        }, {
            errorCode: 2,
        });
    }

}

module.exports = RequestController;
