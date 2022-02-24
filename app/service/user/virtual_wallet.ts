'use strict';

import {BaseService} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {REQUEST_STATUS, REQUEST_TYPE, ROLE, USER_STATUS} from "@/constants";

/** Import Deep Nested Models Attributes Defined Types !*/
import type {/*IModelDeepAttributes*/} from "@/extend/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/user/virtual_wallet";
/** Sequelize Basic QUERY Options [TRANSACTION & LOCKER] INTERFACES !*/
import type {CreateOptions, FindOptions} from "sequelize/types";
/** Sequelize TRANSACTION & LOCKER INTERFACES !*/
import type {/*Transaction, LOCK*/} from "sequelize/types/lib/transaction";
/** Sequelize INCREMENT & DECREMENT OPTION INTERFACES !*/
import type {/*IncrementDecrementOptions, IncrementDecrementOptionsWithBy*/} from "sequelize/types/lib/model";

export default class VirtualWalletService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.User.VirtualWallet;
    }

    /**
     ** - Get Virtual Wallet by its ID
     ** @param {string} virtualWalletId
     ** @param {FindOptions<IAttributes>} [options]
     ** @returns {Promise<*>}
     **/
    async findByPk(virtualWalletId: string, options?: FindOptions<IAttributes>) {
        const {ctx} = this;
        return ctx.model.User.VirtualWallet.findOne({
            rejectOnEmpty: true,
            where: {
                id: virtualWalletId,
            },
            include: ['currency', 'cryptoNetwork'],
            nest: true,
            raw: true,
            ...options,
        });
    }

    /**
     ** - Get users Virtual Wallets by uid
     ** @param {string} uid
     ** @param {FindOptions<IAttributes>} [options]
     ** @returns {Promise<*>}
     **/
    async findAllByUid(uid, options?: FindOptions<IAttributes>) {
        const {ctx} = this;
        return ctx.model.User.VirtualWallet.findAll({
            where: {
                uid: uid,
                ...options?.where,
            },
            attributes: {
                exclude: ['password'],
            },
            include: ['currency', 'cryptoNetwork'],
            nest: true,
            raw: true,
            ...options,
        });
    }

    async findAndCountAllWithUserStatus<T extends Partial<{
        uid: string;
        payId: string;
        payIdArr: string[];
    }>>(options: T, userStatus: string[]) {
        const {app, ctx} = this;

        return await ctx.model.User.VirtualWallet.findAndCountAll({
            where: ctx.helper.removeNullableKeyFrom({
                uid: options?.uid,
                payId: options.payId ? app.Sequelize.where(app.Sequelize.fn('BINARY', app.Sequelize.col('pay_id')), '=', `${options?.payId}`) : null,
                ...(options.payIdArr ? {
                    payId: app.Sequelize.where(app.Sequelize.fn('BINARY', app.Sequelize.col('pay_id')), {[ctx.Op.in]: options.payIdArr}),
                } : {})
            }),
            include: [{
                model: ctx.model.User,
                as: 'user',
                attributes: ["id", "username", "status"],
                where: {
                    status: {[ctx.Op.in]: userStatus},
                },
            }],
            nest: true,
            raw: true,
        });
    }

    /**
     ** - Create new Virtual Wallet & Insert into Database.
     ** @param {ICreationAttributes} virtualWallet
     ** @param {CreateOptions<IAttributes>} options
     ** @returns {Promise}
     **/
    async create<TOptions extends CreateOptions<IAttributes>>(
        virtualWallet: ICreationAttributes,
        options?: TOptions,
    ) {
        const {ctx, service} = this;
        const uid = ctx.user.id;

        const {count: numBankAccounts} = await service.user.bankAccount.findAndCountAll({
            uid: ctx.user.id
        });
        const {count: numVirtualWallets} = await service.user.virtualWallet.findAndCountAll({
            uid: ctx.user.id
        });

        if (numVirtualWallets > 0) {
            throw new ClientError("Bạn chỉ có thể đăng ký 1 ví tiền điện tử, vui lòng cập nhật ví hiện có hoặc xóa bớt để tiếp tục");
        }

        if (numBankAccounts + numVirtualWallets >= 3) {
            throw new ClientError("Bạn chỉ có thể đăng ký 3 tài khoản và ví nhận tiền, vui lòng xóa bớt để tiếp tục đăng ký, vui lòng xóa bớt để tiếp tục đăng ký");
        }

        const {rows: existedVirtualWallet} = await this.findAndCountAllWithUserStatus({payId: virtualWallet.payId}, [USER_STATUS.OPEN, USER_STATUS.SUSPENDED]);
        if (existedVirtualWallet.length > 0) {
            throw new ClientError("Địa chỉ ví điện tử đã được đăng ký trên hệ thống, vui lòng sử dụng ví khác");
        }

        return ctx.model.User.VirtualWallet.create({
            ...virtualWallet,
            uid: uid,
        }, {...options});
    }

    //@ts-ignore
    async update(virtualWallet: any) {
        const {ctx} = this;

        const isAdmin = [ROLE.MANAGER, ROLE.OPERATOR].includes(ctx.user.role.name);

        const currentVirtualWallet = await this.findByPk(virtualWallet.id);
        let updatedVirtualWallet = {...virtualWallet};
        if (updatedVirtualWallet.payId !== currentVirtualWallet.payId) {
            let {rows: existedVirtualWallet} = await this.findAndCountAllWithUserStatus({payId: virtualWallet.payId}, [USER_STATUS.OPEN, USER_STATUS.SUSPENDED]);
            if (existedVirtualWallet.length > 0) {
                throw new ClientError("Địa chỉ ví điện tử đã được đăng ký trên hệ thống, vui lòng sử dụng ví khác");
            }
        }

        if (!isAdmin) {
            await this.checkWdlRequests(updatedVirtualWallet.id, [REQUEST_STATUS.PENDING, REQUEST_STATUS.RECEIVED, REQUEST_STATUS.RESOLVED]);
            updatedVirtualWallet = ctx.helper.omit(updatedVirtualWallet, ['currencyId', 'fullName']);
        }

        await ctx.model.User.VirtualWallet.update({
            ...ctx.helper.removeNullableKeyFrom(updatedVirtualWallet),
        }, {
            where: ctx.helper.removeNullableKeyFrom({
                id: virtualWallet.id,
                uid: !isAdmin ? ctx.user.id : null
            }),
        });

        return ctx.model.User.VirtualWallet.findByPk(virtualWallet.id);
    }

    async deleteById(id: string) {
        const {ctx} = this;

        await this.checkSuspendedCloseStatus();

        const isAdmin = [ROLE.MANAGER, ROLE.OPERATOR].includes(ctx.user.role.name);
        if (!isAdmin) {
            await this.checkWdlRequests(id, [REQUEST_STATUS.PENDING, REQUEST_STATUS.RECEIVED, REQUEST_STATUS.RESOLVED]);
        }

        return ctx.model.User.VirtualWallet.destroy({
            where: ctx.helper.removeNullableKeyFrom({
                id: id,
                uid: !isAdmin ? ctx.user.id : null
            }),
        });
    }

    async checkSuspendedCloseStatus() {
        const {ctx} = this;

        const user = await this.service.user.findByPk(ctx.user.id, {
            rejectOnEmpty: true,
        });

        if (user.status === USER_STATUS.SUSPENDED) {
            throw new ClientError('Tài khoản của bạn đã bị ngừng tạm thời, không thể thực hiện thao tác này, vui lòng liên hệ kỹ thuật viên để hỗ trợ', 400);
        }
    }

    async checkWdlRequests(virtualWalletId: string, statusArr: string[]) {
        const {ctx} = this;

        const pendingWdlRequests = await ctx.service.request.findAll({
            uid: ctx.user.id,
            type: REQUEST_TYPE.WITHDRAW,
            status: {
                [ctx.Op.or]: statusArr
            }
        }, {raw: false});

        const virtualWalletWdlRequest = pendingWdlRequests.find(request => request.data.virtualWalletId === virtualWalletId);
        if (virtualWalletWdlRequest) {
            throw new ClientError("Địa chỉ ví đã được dùng để thực hiện một yêu cầu rút tiền thành công hoặc đang được thực hiện yêu cầu rút tiền. Không thể xóa, chỉnh sửa thông tin. Vui lòng liên hệ đội ngũ chăm sóc khách hàng để được xử lý.");
        } else {
            return null;
        }
    }
}

/** For ES5 Default Import Statement !*/
module.exports.default = VirtualWalletService;
