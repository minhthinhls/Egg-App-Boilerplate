/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

import {BaseService} from "@/extend/class";

/** Import Utils */
import RegExpUtils from "@/utils/regex";
/** Import ES6 Default Dependencies !*/
import * as moment from "moment-timezone";
/** Import ENUMS & CONSTANTS !*/
import {ROLE, USER_STATUS, REQUEST_STATUS, REQUEST_TYPE, REQUEST_TYPE_ENUM} from "@/constants";

/** Import Request Message Service !*/
import RequestMessageService from "./request/message";

/** Sequelize TRANSACTION & LOCKER INTERFACES !*/
import type {Transaction} from "sequelize/types/lib/transaction";
/** Makes All Nested Properties becomes Optional INTERFACES !*/
import type {/*PowerPartial*/} from "egg";
/** Sequelize Basic QUERY Options [TRANSACTION & LOCKER] INTERFACES !*/
import type {FindAndCountOptions} from "sequelize/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/request";
/** Sequelize Model Defined Attributes !*/
import type {IAttributes as IRequestAttributes} from "@/model/request";

declare interface IActivitySummary {
    activity: Record<REQUEST_TYPE_ENUM, Array<Partial<IRequestAttributes>>>;
}

export default class RequestService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.Request;
        BaseService.safeLazyPropertyInject(this, 'message', RequestMessageService);
    }

    /**
     ** - Get User Request with its populated User Field.
     ** @param {string | number} requestId
     ** @param {BaseService.FindOptions} [options]
     ** @returns {Promise<*>}
     ** @ts-ignore ~!*/
    async findOne(requestId: string, options?: BaseService["FindOptions"]) {
        const {ctx} = this;
        return ctx.model.Request.findOne({
            rejectOnEmpty: true,
            where: {
                id: requestId,
            },
            include: [{
                model: ctx.model.User,
                as: 'user',
            }],
            nest: true,
            raw: true,
            ...options,
        });
    }

    /**
     ** - Create new User Request & Insert into Database.
     ** @param {Object} request
     ** @returns {Promise}
     **/
    async create(request: IRequestAttributes) {
        const {ctx, app, service} = this;
        /** Client User creates this Request !*/
        const uid = ctx.user.id;
        const username = ctx.user.username;

        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        const user = await this.service.user.findUserByUid(uid, {
            attributes: {
                exclude: [],
            },
        });
        if (!user) {
            throw new ReferenceError("Cannot found the following User according to their Unique ID");
        }

        if (user.status === USER_STATUS.SUSPENDED) {
            throw new ClientError('Tài khoản của bạn đã bị ngừng tạm thời, vui lòng liên hệ kỹ thuật viên để hỗ trợ', 400);
        }

        const isOperator = [ROLE.MANAGER, ROLE.OPERATOR].includes(user?.role?.name || "");

        if ([REQUEST_TYPE.UPDATE_PROFILE].includes(request['type'])) {
            const curPasswordHashed = ctx.crypto.MD5(request.data?.password.trim()).toString();

            if (user.password !== curPasswordHashed) {
                return ctx.throw(400, new ClientError("Mật khẩu hiện tại không đúng"));
            }
        }
        /** Validate request withdraw params from client */
        if ([REQUEST_TYPE.WITHDRAW].includes(request['type'])) {
            const {isVnpay, password, bankAccountId, virtualWalletId} = request.data;

            const currency = await service.currency.findByPk(request.data.currencyId, {
                rejectOnEmpty: true,
            });

            /** Validate currency name */
            if (request.data.currencyName !== currency.name) {
                throw new ClientError('Tham số không hợp lệ!', 400);
            }

            /** Validate amount */
            if (!RegExpUtils.validPositiveDecimalNumber().test(request.data.amount)) {
                throw new ClientError('Tham số không hợp lệ!', 400);
            }

            /** Validate balance */
            if (Number(request.data.balance) !== Number(request.data.exchangeRate) * Number(request.data.amount)) {
                throw new ClientError("Tham số không hợp lệ!", 400);
            }

            /** Validate exchange rate */
            if (request.data.exchangeRate !== currency.sellPrice) {
                if (request.data.acceptNewPrice) {
                    /** Assign new price to request exchangeRate value */
                    request.data.exchangeRate = currency.sellPrice;
                    request.data.balance = Number(request.data.amount) * request.data.exchangeRate;
                } else {
                    throw new ClientError('Giá rút có sự thay đổi', 400);
                }
            }

            /** - Validate withdraw params sent from client */
            if ((isVnpay && !bankAccountId) || (!isVnpay && !virtualWalletId) || (isVnpay && virtualWalletId) || (!isVnpay && bankAccountId)) {
                throw new ClientError('Tham số không hợp lệ!', 400);
            }

            /** - Validate withdraw password, if failed, update failed count, if success clear failed count */
            if (user.withdrawalPassword !== ctx.crypto.MD5(password).toString()) {
                const countFailedPassword = await ctx.service.user.withdrawalPasswordFailedHandler({username});
                if (countFailedPassword === 3) {
                    throw new ClientError('Tài khoản của bạn đã bị ngừng tạm thời do nhập sai mật khẩu rút tiền quá số lần cho phép, vui lòng liên hệ kỹ thuật viên để được hỗ trợ', 400);
                }
                throw new ClientError('Mật khẩu rút tiền không đúng', 400);
            } else {
                await ctx.service.user.updateUser(uid, {withdrawalPasswordFailed: 0});
            }

            /** - Validate withdrawal amount */
            const currentRequestAmount = Number(request.data.amount) * Number(request.data.exchangeRate);
            const {availableBalance} = await ctx.service.credit.getAvailableCredit(ctx.user.id);

            if (currentRequestAmount < 200_000) {
                throw new ClientError('Số tiền rút nhỏ hơn giới hạn tối thiểu', 400);
            } else if (currentRequestAmount > 100_000_000) {
                throw new ClientError('Số tiền rút lớn hơn giới hạn rút tối đa', 400);
            } else if (currentRequestAmount > availableBalance) {
                throw new ClientError('Số dư khả dụng hiện tại không đủ', 400);
            }

            /** - Validate related withdrawal requests */
            const wdlRequests = await ctx.service.request.findAll({
                uid: ctx.user.id,
                type: REQUEST_TYPE.WITHDRAW,
                status: {
                    [ctx.Op.not]: REQUEST_STATUS.CANCELLED
                }
            }, {raw: false});

            let pendingWdlAmount = 0;
            const todayWdlAmount = wdlRequests
                .reduce((prev, curRequest) => {
                    if ([REQUEST_STATUS.PENDING, REQUEST_STATUS.RECEIVED].indexOf(curRequest.status) >= 0) {
                        pendingWdlAmount += curRequest.data.amount;
                    }
                    const reqDate = moment(curRequest.createdAt).format('YYYY-MM-DD');
                    if (reqDate !== moment().format('YYYY-MM-DD')) {
                        return prev;
                    }
                    return prev + Number(curRequest.data.amount);
                }, 0);

            if (pendingWdlAmount > 0) {
                throw new ClientError('Bạn đang có yêu cầu rút tiền đang xử lý, vui lòng chờ lệnh hoàn tất', 400);
            } else if (todayWdlAmount + currentRequestAmount > 300000000) {
                throw new ClientError(`Số tiền vượt quá hạn mức rút tiền trong ngày hôm nay (hạn mức còn lại: ${300000000 - todayWdlAmount}VND), vui lòng quay lại vào ngày mai hoặc thử lại với số tiền nhỏ hơn`, 400);
            }
        }

        /** Validate request top-up params from client */
        if ([REQUEST_TYPE.DEPOSIT].includes(request['type'])) {

            const currency = await service.currency.findByPk(request.data.currencyId, {
                rejectOnEmpty: true,
            });

            /** Validate currency name */
            if (request.data.currencyName !== currency.name) {
                throw new ClientError('Tham số không hợp lệ!', 400);
            }

            /** Validate amount */
            if (!RegExpUtils.validPositiveDecimalNumber().test(request.data.amount)) {
                throw new ClientError('Tham số không hợp lệ!', 400);
            }

            /** Validate balance */
            if (Number(request.data.balance) !== Number(request.data.exchangeRate) * Number(request.data.amount)) {
                throw new ClientError("Tham số không hợp lệ!", 400);
            }

            if (request.data.exchangeRate !== currency.buyPrice) {
                if (!request.data.acceptNewPrice) {
                    throw new ClientError('Giá nạp có sự thay đổi', 400);
                }
                /** Assign new price to request exchangeRate value */
                request.data.exchangeRate = currency.buyPrice;
                request.data.balance = Number(request.data.amount) * request.data.exchangeRate;
            }
        }

        /** Validate request create/re-open account from client */
        if ([REQUEST_TYPE.CREATE_ACCOUNT, REQUEST_TYPE.REOPEN_ACCOUNT].includes(request['type'])) {
            const activeAccount = await service.account.findActiveAccountByUserBanker(request.data.bankerId);

            /** If user has active account, reject this request */
            if (activeAccount) {
                /** You've already had active bet account of this banker !*/
                throw new ClientError("Bạn đã có tài khoản cược đang hoạt động cho nhà cái này", 400);
            }

            /** Only have one request create account with the same banker */
            const allRunningRequestCreateAccount = await ctx.model.Request.findAll({
                where: {
                    uid: ctx.user.id,
                    type: REQUEST_TYPE.CREATE_ACCOUNT,
                    status: {
                        [ctx.Op.in]: [REQUEST_STATUS.PENDING, REQUEST_STATUS.RECEIVED]
                    },
                }
            });

            const allRunningRequestCreateAccountThisBanker = allRunningRequestCreateAccount.filter(runningRequest => {
                return runningRequest.data.bankerId === request.data.bankerId;
            });

            if (allRunningRequestCreateAccountThisBanker.length > 0) {
                /** You've already had request create account of this banker !*/
                throw new ClientError("Bạn đã có yêu cầu tạo tài khoản cược cho nhà cái này", 400);
            }

            /** Validate banker */
            const banker = await service.banker.findByPk(request.data.bankerId, {
                rejectOnEmpty: true,
                include: [{
                    model: ctx.model.Price,
                    as: 'prices',
                    attributes: ['id', 'name', 'exchangeRate'],
                }],
                nest: true,
                raw: false,
            });

            if (banker.name !== request.data.bankerName) {
                throw new ClientError("Tham số không hợp lệ!", 400);
            }

            if (request.type === REQUEST_TYPE.CREATE_ACCOUNT) {
                /** Validate priceId, priceName, exchangeRate */
                const price = await service.price.findByPk(request.data.priceId, {
                    rejectOnEmpty: true
                });

                if (price.name !== request.data.priceName) {
                    throw new ClientError("Tham số không hợp lệ!", 400);
                }

                const checkPriceBelongsToBanker = banker.prices?.find(p => p.id === price.id);
                if (!checkPriceBelongsToBanker) {
                    throw new ClientError("Giá đô không hợp lệ!", 400);
                }

                /** Update newest exchange rate */
                if (price.exchangeRate !== request.data.exchangeRate) {
                    request.data.exchangeRate = price.exchangeRate;
                }

                /** Validate amount */
                if (!RegExpUtils.validPositiveDecimalNumber().test(request.data.amount)) {
                    throw new ClientError('Tham số không hợp lệ!', 400);
                }

                /** Validate balance */
                if (Number(request.data.balance) !== Number(request.data.exchangeRate) * Number(request.data.amount)) {
                    throw new ClientError("Tham số không hợp lệ!", 400);
                }

                const userCredit = await service.credit.getAvailableCredit(uid);
                if (Number(request.data.balance) > userCredit.availableBalance) {
                    throw new ClientError("Không đủ số dư khả dụng!", 400);
                }

                if (request.data.promotionId) {
                    /** Promotion only support this bankers */
                    if (!['VIVA88', 'SBOBET', 'SV388', 'P88BET', '3IN1BET'].includes(banker.name.trim().toUpperCase())) {
                        throw new ClientError("Tham số không hợp lệ!", 400);
                    }
                }
            }

            if (request.type === REQUEST_TYPE.REOPEN_ACCOUNT) {
                const account = await service.account.findByPk(request.data.accountId, {
                    rejectOnEmpty: true,
                    include: [{
                        model: ctx.model.Price,
                        as: 'price',
                        attributes: ['exchangeRate'],
                    }],
                });
                if (account.price?.exchangeRate !== request.data.exchangeRate) {
                    throw new ClientError("Tham số không hợp lệ!", 400);
                }
            }
        }

        /** Validate request transfer-in/withdraw from client */
        if ([REQUEST_TYPE.TRANSFER_IN, REQUEST_TYPE.TRANSFER_OUT].includes(request['type'])) {
            /** Validate amount */
            if (!RegExpUtils.validPositiveDecimalNumber().test(request.data.amount)) {
                throw new ClientError('Tham số không hợp lệ!', 400);
            }

            /** Validate balance */
            if (Number(request.data.balance) !== Number(request.data.exchangeRate) * Number(request.data.amount)) {
                throw new ClientError("Tham số không hợp lệ!", 400);
            }

            const allRunningTransferRequests = await ctx.model.Request.findAll({
                where: {
                    uid: ctx.user.id,
                    status: {[ctx.Op.in]: [REQUEST_STATUS.PENDING, REQUEST_STATUS.RECEIVED]},
                    type: {[ctx.Op.in]: [REQUEST_TYPE.TRANSFER_IN, REQUEST_TYPE.TRANSFER_OUT]},
                },
            });

            const allRunningTransferRequestCurAccount = allRunningTransferRequests.filter(runningRequest => {
                return runningRequest.data.accountId === request.data.accountId;
            });

            if (allRunningTransferRequestCurAccount.length > 0) {
                /** You've already had request transfer in/out on this account !*/
                throw new ClientError("Bạn đang có yêu cầu bơm/rút điểm trên tài khoản này chưa được xử lý", 400);
            }

        }

        const microTxCallbackTasks: Array<(tx: Transaction, callbackData: {[p: string]: any}) => Promise<void>> = [];

        /** Create default Account Promotion when user creating new Bet Account */
        if ([REQUEST_TYPE.CREATE_ACCOUNT, REQUEST_TYPE.TRANSFER_IN].includes(request['type'])) {
            const {promotionId} = request.data;
            /** TODO: Currently support only Transfer-In Promotions !*/
            microTxCallbackTasks.push(async (/*tx, callbackData*/) => {

                /** Nếu yêu cầu không thoả chương trình khuyến mãi nào */
                if (!promotionId) {
                    return Promise.resolve(void 0);
                }

                return Promise.resolve(void 0);
            });
        }

        /** Insert request */
        function generateRequestCode() {
            let nowStr = Math.floor(Date.now() / 1000) + '';
            nowStr = nowStr.slice(3);
            const rdm = Math.floor(Math.random() * 1000) + '';
            const rdmStr = '000'.substring(0, 3 - rdm.length) + rdm;

            return nowStr + rdmStr;
        }

        request.code = generateRequestCode();

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            const [requestRes] = await Promise.all([
                ctx.model.Request.create({...request, uid: uid, note: request.data.note}, {
                    individualHooks: true,
                    transaction: tx,
                    user: ctx.user,
                    message: isOperator ? request.data?.note : "Thành viên yêu cầu",
                })
            ]);

            /** When User sent Request to CLOSE their BETS_ACCOUNT !*/
            const serviceCreateRequest = async (...args): Promise<void> => args && void 0;
            /** TODO: Service Create Request ~!*/
            await serviceCreateRequest(this, {
                uid: uid,
                currRequestState: requestRes,
                prevRequestState: null,
                userRequestData: request,
                tx: tx,
            });

            /** Chaining all relative Tasks via SequelizeTransaction from outer scope [Array: microTxCallbackTasks] !*/
            await Promise.all([
                ...microTxCallbackTasks.map((callbackFn) => callbackFn(tx, {requestId: requestRes.id})),
            ]);

            return requestRes;
        });
    }

    /**
     ** - Update User Request & Modify all Related Rows into Database.
     ** @param {Object} request - The request sent from Client Side
     ** @returns {Promise}
     ** @ts-ignore ~!*/
    async update(request: any) {
        const {ctx, app, service} = this;
        /** User ID of Operator & Manager !*/
        const uid = ctx.user.id;
        const user = await service.user.findUserByUid(uid);
        const isOperator = [ROLE.MANAGER, ROLE.OPERATOR].includes(user?.role?.name || "");

        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            const prevRequestState = await this.findOne(request.id, {transaction: tx, lock: tx.LOCK.UPDATE});
            if (!prevRequestState) {
                throw new Error('Bad request, not found request to update');
            }

            /** If Request already CANCELLED or RESOLVED then reject !*/
            if ([REQUEST_STATUS.CANCELLED, REQUEST_STATUS.RESOLVED].includes(prevRequestState.status)) {
                /** This request has already been either resolved or cancelled !*/
                throw new ClientError("Yêu cầu này đã được giải quyết xong hoặc đã bị hủy", 400);
            }

            /** If Request already RECEIVED, then reject request CANCEL of user */
            if ([REQUEST_STATUS.RECEIVED].includes(prevRequestState['status']) && ctx.user.role?.name === ROLE.MEMBER) {
                /** This request is being processing, can not cancel !*/
                throw new ClientError("Yêu cầu này đang được giải quyết, không thể hủy", 400);
            }

            /**
             ** - Updating request
             ** - Model static update function got only two arguments
             ** - Mysql: Not support update and return result
             ** @see {@link https://sequelize.org/master/class/lib/model.js~Model.html}
             ** - [individualHooks] Because of having no static function like updateOne, set individualHooks = true in order to trigger individual hooks
             ** @see {@link https://stackoverflow.com/questions/64412802/why-sequelize-beforeupdate-hook-doesnt-work}
             **/
            await ctx.model.Request.update( /** Update Fields */ {
                status: request.status,
                updatedBy: ctx.user.id,
            }, /** Queries & Options */ {
                where: {id: request.id},
                individualHooks: true,
                transaction: tx,
                /** Passing "user" to Transaction Options for Logging Purposes !*/
                user: ctx.user,
                message: isOperator ? request.content : ((request.status === REQUEST_STATUS.CANCELLED) ? "Thành viên yêu cầu hủy" : "Thành viên yêu cầu")
                /* Not supported in MySQL !*/
                // returning: true,
            });

            /** Request data queried from SQL Database !*/
            const requestRes = await this.findOne(request.id, {raw: false, transaction: tx}); // raw false to use getter
            if (!requestRes) {
                return Promise.reject(new ReferenceError("Cannot found just-in-time updated Request Model"));
            }

            /** If this Request updated into [RESOLVED] Status !*/
            switch (request.status) {
                case REQUEST_STATUS.RESOLVED:
                    const serviceUpdateRequestResolved = async (...args): Promise<void> => args && void 0;
                    /** TODO: Service Update Request Resolved ~!*/
                    await serviceUpdateRequestResolved(this, {
                        uid: uid,
                        currRequestState: requestRes,
                        prevRequestState: prevRequestState,
                        userRequestData: request,
                        tx: tx,
                    });
                    break;
                case REQUEST_STATUS.CANCELLED:
                    const serviceUpdateRequestCancelled = async (...args): Promise<void> => args && void 0;
                    /** TODO: Service Update Request Cancelled ~!*/
                    await serviceUpdateRequestCancelled(this, {
                        uid: uid,
                        currRequestState: requestRes,
                        prevRequestState: prevRequestState,
                        userRequestData: request,
                        tx: tx,
                    });
                    break;
            }

            /** Run every time Operator or Manager change properties of this Request !*/
            isOperator && await Promise.all([
                /** - Step 3.1: Create new Message and send back to User who owned this Request !*/
                service.message.create( /** Create Fields */ {
                    uid: requestRes.uid,
                    title: request.title,
                    requestId: request.id,
                    content: request.content,
                }, /** Optional Transaction */ {
                    transaction: tx
                }),
            ]);

            return requestRes;
        });
    }

    /**
     ** @param {FindAndCountOptions<IAttributes>} [options]
     ** @returns {Promise}
     **/
    async findAndCountAll<TExtraOptions extends Partial<{
        uid: string;
        code: string;
        startDate: string;
        endDate: string;
        username: string;
        requestType: Array<string>;
        status: Array<string>;
    }>>(options?: TExtraOptions & FindAndCountOptions<IAttributes>) {
        const {ctx, app} = this;

        return ctx.model.Request.findAndCountAll({
            where: ctx.helper.removeNullableKeyFrom({
                [ctx.Op.and]: [
                    options?.endDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('request.created_at')),
                        '<=',
                        options?.endDate || Date.now().toString()
                    ) : null,
                    options?.startDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('request.created_at')),
                        '>=',
                        options?.startDate || Date.now().toString()
                    ) : null,
                ].filter(Boolean),
                ...(options?.code ? {
                    [ctx.Op.or]: [{
                        code: {[ctx.Op.like]: '%' + options.code + '%'},
                    }, {
                        id: {[ctx.Op.like]: '%' + options.code + '%'},
                    }],
                } : {}),
                type: options?.requestType ? {
                    [ctx.Op.in]: options.requestType,
                } : null,
                status: options?.status ? {
                    [ctx.Op.in]: options.status,
                } : null,
                uid: options?.uid,
            }),
            include: [{
                model: ctx.model.User,
                as: 'user',
                attributes: ['id', 'username', 'fullName', 'status'],
                order: [
                    ['createdAt', 'DESC'],
                ],
                where: {username: {[ctx.Op.like]: options?.username ? ('%' + options?.username + '%') : '%'}},
            }, {
                model: ctx.model.User,
                as: 'updatedByUser',
                required: false,
                attributes: ['id', 'username', 'fullName'],
            }, {
                model: ctx.model.Message,
                as: 'chatMessages',
                attributes: ['id', 'title', 'content', 'createdAt'],
                order: [
                    ['createdAt', 'DESC'],
                ],
                limit: 1,
            }],
            order: [
                ['createdAt', 'DESC'],
            ],
            distinct: true,
            nest: true,
            ...options,
        });
    }

    /**
     ** @to-keep
     ** @param {Object} data
     **/
    async getWaitingCount<T extends {uid: string}>(data?: T) {
        const {ctx} = this;

        const userFilterQueries = ctx.helper.pickNonNullable({
            ...data,
        }, [
            'uid',
        ]);

        return ctx.model.Request.count({
            where: {
                status: {[ctx.Op.in]: ['PENDING', 'RECEIVED']},
                ...userFilterQueries,
            },
            group: ['type'],
        });
    }

    async getSummary<T extends {uid: string}>(data: T): Promise<IActivitySummary> {
        const {ctx} = this;

        const userFilterQueries = ctx.helper.pickNonNullable({
            ...data,
        }, [
            'uid',
        ]);

        /** Query all requests of user */
        const allRequests = await ctx.model.Request.findAll({
            where: {
                ...userFilterQueries,
            },
            attributes: ['id', 'type', 'data', 'status', 'createdAt', 'updatedAt'],
            order: [['createdAt', 'DESC']],
        });

        /** Build summary */
        const activitySummary: IActivitySummary = {
            activity: {
                CREATE_ACCOUNT: [],
                CLOSE_ACCOUNT: [],
                REOPEN_ACCOUNT: [],
                RESET_PASSWORD: [],
                TRANSFER_IN: [],
                TRANSFER_OUT: [],
                DEPOSIT: [],
                WITHDRAW: [],
                UPDATE_PROFILE: [],
            },
        };

        allRequests.forEach(function (request) {
            activitySummary.activity[request.type].push(request);
        });

        return activitySummary;
    }

    /**
     ** @param {PlainObject} options
     ** @returns {Promise}
     **/
    async findAndCountAllRequestHistory<T extends Partial<{
        endDate: string;
        startDate: string;
        status: string;
        requestId: string;
        requestType: string;
        updatedBy: string;
        uid: string;
        requestCode: string;
    }>>(options: T) {
        const {ctx, app} = this;
        return await ctx.model.Request.History.findAndCountAll({
            where: {
                [ctx.Op.and]: [
                    options?.startDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('request_history.created_at')),
                        '>=',
                        options.startDate
                    ) : null,
                    options?.endDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('request_history.created_at')),
                        '<=',
                        options.endDate
                    ) : null,
                ].filter(ctx.helper.NonNullableOrUndefined),
                ...ctx.helper.pickNonNullable({
                    ...options,
                    type: options.requestType,
                }, [
                    'requestId', 'type', 'status', 'updatedBy', 'uid',
                ]),
            },
            include: [{
                model: ctx.model.User,
                as: 'changedBy',
                attributes: ["id", "username"],
            }, {
                model: ctx.model.Request,
                as: 'request',
                attributes: ["code", "id"],
                where: options?.requestCode ? {
                    [ctx.Op.or]: [{
                        code: {[ctx.Op.like]: '%' + options.requestCode + '%'},
                    }, {
                        id: {[ctx.Op.like]: '%' + options.requestCode + '%'},
                    }],
                } : {},
            }, {
                model: ctx.model.User,
                as: 'user',
                attributes: ["id", "username"],
            }],
            order: [['createdAt', 'DESC']],
            nest: true,
            raw: true,
        });
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = RequestService;
