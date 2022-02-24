'use strict';

import {BaseService} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {ACCOUNT_STATUS} from "@/constants";
/** Import ENUMS & CONSTANTS !*/
import {REQUEST_STATUS, REQUEST_TYPE} from "@/constants";
/** Import Pre-Defined Types Helper !*/
import type {PlainObject} from "@/extend/types";
/** Import Deep Nested Models Attributes Defined Types !*/
import type {/*IModelDeepAttributes*/} from "@/extend/types";

/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/account";

/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";
import type {IAttributes as IPriceAttributes} from "@/model/price";
import type {IAttributes as IProductAttributes} from "@/model/product";
import type {IAttributes as IAccountAttributes} from "@/model/account";
import type {IAttributes as IBankerProductAttributes} from "@/model/banker_product";
import type {IAttributes as IRefundCommissionAttributes} from "@/model/commission/refund/config";

export declare interface IWinlossTurnover {
    /** Account ID !*/
    id: string;
    user: Pick<IUserAttributes, 'id' | 'username'>;
    account: Pick<IAccountAttributes, 'id' | 'uid' | 'username' | 'banker'>;
    price: Pick<IPriceAttributes, 'id' | 'name' | 'exchangeRate'>;
    percent: {
        /** Currently not in use */
        turnover: PlainObject<IProductAttributes["id"], IRefundCommissionAttributes["percent"]>;
        /** Tính năng hoàn trả hoa hồng theo ngày, dựa vào net turnover */
        netTurnover: PlainObject<IProductAttributes["id"], IRefundCommissionAttributes["percent"]>;
        /** Currently not in use */
        winloss: PlainObject<IProductAttributes["id"], IRefundCommissionAttributes["percent"]>;
    };
    fromDate: 'YYYY-MM-DD' | string;
    toDate: 'YYYY-MM-DD' | string;
}

export declare interface IMonthlyWinlossTurnover extends Omit<IWinlossTurnover, 'price' | 'percent' | 'fromDate' | 'toDate'> {
    fromDate: 'YYYY-MM' | string;
    toDate: 'YYYY-MM' | string;
}

export declare interface IAgentMonthlySettlementReport {
    id: IUserAttributes["id"];
    /** - [User] => Đại lý giới thiệu người chơi !*/
    user: Pick<IUserAttributes, 'id' | 'username' | 'invitedUsers'>;
    percent: number;
    /** Tổng Turnover toàn bộ Referral Users. Đơn vị tiền [VNĐ] !*/
    totalTurnover: number;
    /** Tổng Net Turnover toàn bộ Referral Users. Đơn vị tiền [VNĐ] !*/
    totalNetTurnover: number;
    /** Tổng WinLoss toàn bộ Referral Users. Đơn vị tiền [VNĐ] !*/
    totalWinloss: number;
    /** Tổng Turnover theo từng Referral User. Đã được tính sang đơn vị tiền VNĐ !*/
    turnoverByUser: PlainObject<IUserAttributes["id"], number>;
    /** Tổng Net Turnover theo từng Referral User. Đã được tính sang đơn vị tiền VNĐ !*/
    netTurnoverByUser: PlainObject<IUserAttributes["id"], number>;
    /** Tổng WinLoss theo từng Referral User. Đã được tính sang đơn vị tiền VNĐ !*/
    winlossByUser: PlainObject<IUserAttributes["id"], number>;
    /** Số lượng Users được giới thiệu có phát sinh vé cược trong tháng !*/
    numActiveReferral: number;
    /** Nếu người được giới thiệu chơi thua, Agent Affiliate sẽ nhận hoa hồng dương, và ngược lại. !*/
    totalRefund: number;
    fromDate: 'YYYY-MM' | string;
    toDate: 'YYYY-MM' | string;
}

/**
 ** - Create all Placeholder by ProductID to insert Winloss & Turnover
 ** - By default, if there were no winloss/turnover then value will be set to [0]
 ** @template T, R
 ** @param {Array<T>} list
 ** @param {string} [key]
 ** @returns {Record<IProductAttributes.id, number>}
 **/
export const setProductPlaceholder = <T extends IBankerProductAttributes, R extends PlainObject<IProductAttributes["id"] | IProductAttributes["name"], number>>(
    list: Array<T>, key = "id"
): R => {
    const destObj: PlainObject<IProductAttributes["id"], number> = {};
    for (let i = 0; i < list.length; i++) {
        const bankerProduct = list[i];
        if (!bankerProduct.product) {
            throw new ReferenceError("Cannot found [Product] from [BankerProduct] Record !");
        }
        if (!bankerProduct.product[key]) {
            throw new ReferenceError("Cannot found [ProductID or ProductName] from [BankerProduct] Record !");
        }
        destObj[bankerProduct.product[key]] = 0;
    }
    return destObj as R;
};

export default class AccountService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.Account;
    }

    /**
     ** - Update Bet Account
     ** @param {string} accountId
     ** @param {string} status
     ** @param {string} message
     **/
    async updateStatus(accountId: string, status: string, message: string): Promise<boolean | never> {
        const {ctx, service, app} = this;
        const account = await this.findByPk(accountId, {
            include: {
                model: ctx.model.Banker,
                as: 'banker',
                attributes: ['name'],
            },
            rejectOnEmpty: true,
        });

        /** Check whether user has already had an ACTIVE account of this banker */
        const activeAccount = await service.account.findActiveAccountByUserBanker(account.bankerId, account.uid);

        if (status === ACCOUNT_STATUS.OPEN && activeAccount) {
            /** User has already has an active account of this banker !*/
            throw new ClientError("Người dùng đã có tài khoản cược hoạt động của nhà cái này", 400);
        }

        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            await ctx.model.Account.update({status: status}, {
                where: {id: accountId},
                individualHooks: true,
                transaction: tx,
                user: ctx.user,
                message: message,
            });
            await Promise.all([
                /** - Step 3.1: Create new Message and send back to User who owned this Request !*/
                service.message.create( /** Create Fields */ {
                    uid: account.uid,
                    title: `Trạng thái tài khoản cược ${account.username} - ${account.banker?.name} có sự thay đổi`,
                    content: message,
                }, /** Optional Transaction */ {
                    transaction: tx,
                }),
            ]);
            return true;
        });
    }

    /**
     ** @param {Object} options
     ** @returns {Promise}
     **/
    async findAndCountAll<T extends Partial<{
        endDate: string;
        startDate: string;
        uid: string;
        status: string;
        bankerId: string;
        priceId: string;
        accountUsername: string;
    }>>(options: T) {
        const {ctx, app} = this;

        return ctx.model.Account.findAndCountAll({
            where: {
                [ctx.Op.and]: [
                    options?.endDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('account.created_at')),
                        '<=',
                        options.endDate
                    ) : null,
                    options?.startDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('account.created_at')),
                        '>=',
                        options.startDate
                    ) : null,
                ].filter(ctx.helper.NonNullableOrUndefined),
                ...ctx.helper.removeNullableKeyFrom(ctx.helper.pick({
                    ...options,
                    username: {
                        [ctx.Op.like]: options.accountUsername ? '%' + options.accountUsername + '%' : '%'
                    },
                }, [
                    "uid", "status", "bankerId", "priceId", "username",
                ])),
            },
            attributes: {
                exclude: ['password'],
            },
            include: [{
                model: ctx.model.User,
                as: 'user',
                attributes: ['id', 'username'],
            }, {
                model: ctx.model.Banker,
                as: 'banker',
                attributes: ['id', 'name'],
            }, {
                model: ctx.model.Price,
                as: 'price',
                attributes: ['id', 'name'],
            }],
            order: [
                ['createdAt', 'DESC'],
            ],
            nest: true,
            ...options,
        });
    }

    /**
     ** @param {string} uid
     ** @returns {Promise}
     **/
    async summaryByUid(uid: string) {
        const {ctx, service} = this;

        /** Query data */
        const [accounts, bankers, allRunningCreateAccountRequest] = await Promise.all([
            ctx.model.Account.findAll({
                where: {
                    uid: uid,
                    status: {[ctx.Op.in]: [ACCOUNT_STATUS.OPEN, ACCOUNT_STATUS.CLOSING, ACCOUNT_STATUS.REOPENING]},
                },
                include: ['price'],
                nest: true,
                raw: true,
            }),
            service.banker.findAll({}, {
                nest: true,
                order: [['createdAt', 'ASC']],
            }),
            ctx.model.Request.findAll({
                where: {
                    uid: ctx.user.id,
                    type: REQUEST_TYPE.CREATE_ACCOUNT,
                    status: {[ctx.Op.in]: [REQUEST_STATUS.PENDING, REQUEST_STATUS.RECEIVED]},
                },
            }),
        ]);

        /** Create mapper */
        const accountMapper = ctx.helper.fromArrayToHashMap(accounts, 'bankerId');
        const runningRequestMapper = ctx.helper.fromArrayToHashMapUseCallback(allRunningCreateAccountRequest, (request) => {
            return [request.data.bankerId, request];
        });

        /** Create return data */
        return bankers.map((banker) => {
            const account = accountMapper.get(banker.id);
            const runningRequest = runningRequestMapper.get(banker.id);

            return ({
                ...banker,
                hasAccount: Boolean(account),
                account: account && {
                    ...account,
                    bankerName: banker.name,
                },
                isCreating: Boolean(runningRequest),
            });
        });
    }

    /**
     ** @param {string} status
     ** @returns {Promise}
     **/
    async findAllByStatus<T extends string = keyof typeof ACCOUNT_STATUS>(status: Array<T> | T) {
        const {ctx} = this;
        const {bankerName, priceId} = ctx.params;

        return ctx.model.Account.findAndCountAll({
            where: {
                uid: ctx.user.id,
                status: {
                    [ctx.Op.in]: status instanceof Array ? status : [status],
                },
            },
            attributes: {
                exclude: ['password'],
            },
            include: [{
                model: ctx.model.Banker,
                as: 'banker',
                where: ctx.helper.removeNullableKeyFrom({
                    name: bankerName ? {
                        [ctx.Op.in]: bankerName,
                    } : null,
                }),
            }, {
                model: ctx.model.Price,
                as: 'price',
                where: ctx.helper.removeNullableKeyFrom({
                    id: priceId ? {
                        [ctx.Op.in]: priceId,
                    } : null,
                }),
            }],
            nest: true,
            raw: true,
        });
    }

    /**
     ** @param {PlainObject} options
     ** @returns {Promise}
     **/
    async findAndCountAllHistory<T extends Partial<{
        endDate: string;
        startDate: string;
        uid: string;
        status: string;
        bankerId: string;
        priceId: string;
        accountUsername: string;
        updatedBy: string;
    }>>(options: T) {
        const {ctx, app} = this;

        const userAccountHistory = await ctx.model.Account.History.findAndCountAll({
            where: {
                [ctx.Op.and]: [
                    options?.startDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('account_history.created_at')),
                        '>=',
                        options.startDate
                    ) : null,
                    options?.endDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('account_history.created_at')),
                        '<=',
                        options.endDate
                    ) : null,
                ].filter(ctx.helper.NonNullableOrUndefined),
                ...ctx.helper.pickNonNullable({
                    ...options,
                    username: {
                        [ctx.Op.like]: options?.accountUsername ? '%' + options.accountUsername + '%' : '%',
                    },
                }, [
                    'uid', 'bankerId', 'status', 'username', 'updatedBy'
                ]),
            },
            include: [{
                model: ctx.model.Account,
                as: 'account',
                where: ctx.helper.removeNullableKeyFrom({
                    bankerId: options.bankerId ? {
                        [ctx.Op.in]: options.bankerId,
                    } : null,
                }),
                include: [{
                    model: ctx.model.Banker,
                    as: 'banker',
                }, {
                    model: ctx.model.Price,
                    as: 'price',
                }],
            }, {
                model: ctx.model.User,
                as: 'user',
                attributes: ["id", "username"],
            }, {
                model: ctx.model.User,
                as: 'changedBy',
                attributes: ["id", "username"],
            }],
            order: [
                ['createdAt', 'DESC'],
            ],
            nest: true,
            raw: true,
            ...options,
        });
        const _AccountHistoryMapper = ctx.helper.fromArrayToHashMap(userAccountHistory.rows, 'requestId');

        /** Some History will have requestId inject inside, these are user modify Account Status as Request !*/
        const someRequest = await ctx.model.Request.findAll({
            where: {
                id: {[ctx.Op.in]: userAccountHistory.rows.map((accountHistory) => accountHistory.requestId).filter(ctx.helper.NonNullableOrUndefined)},
            },
            raw: true,
        });

        /** Insert Request Instance into some of Account History row !*/
        someRequest.forEach((request) => {
            const _AccountHistory = _AccountHistoryMapper.get(request.id);
            if (!_AccountHistory) {
                return void 0;
            }
            return _AccountHistory.request = request;
        });

        return userAccountHistory;
    }

    /**
     ** - Get active account of user by banker
     ** @param {string}bankerId
     ** @param {string} [uid]
     ** @returns {Promise}
     **/
    async findActiveAccountByUserBanker(bankerId, uid = '') {
        const {ctx} = this;

        return ctx.model.Account.findOne({
            where: {
                uid: uid || ctx.user.id,
                bankerId: bankerId,
                status: {[ctx.Op.in]: [ACCOUNT_STATUS.OPEN, ACCOUNT_STATUS.CLOSING]},
            },
            attributes: {
                exclude: ['password'],
            },
        });
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = AccountService;
