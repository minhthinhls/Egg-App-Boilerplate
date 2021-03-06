'use strict';

import {BaseService} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {REQUEST_STATUS, REQUEST_TYPE, ROLE, USER_STATUS} from "@/constants";

/** Import Deep Nested Models Attributes Defined Types !*/
import type {/*IModelDeepAttributes*/} from "@/extend/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/user/bank_account";
/** Sequelize Basic QUERY Options [TRANSACTION & LOCKER] INTERFACES !*/
import type {CreateOptions, FindOptions} from "sequelize/types";
/** Sequelize TRANSACTION & LOCKER INTERFACES !*/
import type {/*Transaction, LOCK*/} from "sequelize/types/lib/transaction";
/** Sequelize INCREMENT & DECREMENT OPTION INTERFACES !*/
import type {/*IncrementDecrementOptions, IncrementDecrementOptionsWithBy*/} from "sequelize/types/lib/model";

export default class BankAccountService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.User.BankAccount;
    }

    /**
     ** - Get bank account by its ID
     ** @param {string} bankAccountId
     ** @param {FindOptions<IAttributes>} [options]
     ** @returns {Promise<*>}
     **/
    async findByPk(bankAccountId: string, options?: FindOptions<IAttributes>) {
        const {ctx} = this;
        return ctx.model.User.BankAccount.findOne({
            rejectOnEmpty: true,
            where: {
                id: bankAccountId,
            },
            include: ['bank'],
            nest: true,
            raw: true,
            ...options,
        });
    }

    /**
     ** - Get users Bank Accounts by uid
     ** @param {string} uid
     ** @param {FindOptions<IAttributes>} [options]
     ** @returns {Promise<*>}
     **/
    async findAllByUid(uid, options?: FindOptions<IAttributes>) {
        const {ctx} = this;
        return ctx.model.User.BankAccount.findAll({
            where: {
                uid: uid,
                ...options?.where,
            },
            attributes: {
                exclude: ['password'],
            },
            include: ['bank'],
            nest: true,
            raw: true,
            order: [
                ['createdAt', 'DESC'],
            ],
            ...options,
        });
    }

    async findAndCountAllWithUserStatus<T extends Partial<{
        uid: string;
        cardInfo: {bankId: string, cardNo: string} | Array<{bankId: string, cardNo: string}>;
    }>>(options: T, userStatus: Array<string>) {
        const {ctx} = this;

        const query = options.cardInfo instanceof Array ? {
            [ctx.Op.or]: options.cardInfo.map(card => {
                return {bankId: card.bankId, cardNo: card.cardNo};
            })
        } : {
            bankId: options.cardInfo?.bankId,
            cardNo: options.cardInfo?.cardNo
        };

        return await ctx.model.User.BankAccount.findAndCountAll({
            where: ctx.helper.removeNullableKeyFrom({
                uid: options?.uid,
                ...query,
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
     ** - Create new Bank Account & Insert into Database.
     ** @param {ICreationAttributes} bankAccount
     ** @param {CreateOptions<IAttributes>} options
     ** @returns {Promise}
     **/
    async create<TOptions extends CreateOptions<IAttributes>>(
        bankAccount: ICreationAttributes,
        options?: TOptions,
    ) {
        const {ctx, service} = this;

        await this.checkSuspendedCloseStatus();

        const existedBank = await service.user.bankAccount.findOne({
            bankId: bankAccount.bankId,
            uid: ctx.user.id
        });
        if (existedBank) {
            throw new ClientError("B???n ch??? c?? th??? ????ng k?? m???t t??i kho???n tr??n m???i ng??n h??ng, vui l??ng ch???n ng??n h??ng kh??c ho???c x??a th??? hi???n c??");
        }

        const {count: numBankAccounts} = await service.user.bankAccount.findAndCountAll({
            uid: ctx.user.id
        });
        const {count: numVirtualWallets} = await service.user.virtualWallet.findAndCountAll({
            uid: ctx.user.id
        });

        if (numBankAccounts + numVirtualWallets >= 3) {
            throw new ClientError("B???n ch??? c?? th??? ????ng k?? 3 t??i kho???n v?? v?? nh???n ti???n, vui l??ng x??a b???t ????? ti???p t???c ????ng k??");
        }

        const currentUser = await service.user.findUserByUid(ctx.user.id);

        await this.checkBankAccountName(bankAccount.cardName, currentUser?.fullName);

        const existedBankAccountList = await this.findAndCountAllWithUserStatus({
            cardInfo: {
                bankId: bankAccount.bankId,
                cardNo: bankAccount.cardNo
            }
        }, [USER_STATUS.OPEN, USER_STATUS.SUSPENDED]);
        if (existedBankAccountList.rows.length > 0) {
            throw new ClientError("Th??? ng??n h??ng ???? ???????c ????ng k?? tr??n h??? th???ng, vui l??ng s??? d???ng th??? kh??c");
        }

        const uid = ctx.user.id;

        return ctx.model.User.BankAccount.create({
            ...bankAccount,
            uid: uid,
        }, {...options});
    }

    //@ts-ignore
    async update(bankAccount: any) {
        const {ctx, service} = this;

        await this.checkSuspendedCloseStatus();

        const isAdmin = [ROLE.MANAGER, ROLE.OPERATOR].includes(ctx.user.role.name);

        const currentBankAccount = await service.user.bankAccount.findByPk(bankAccount.id);
        let updatedBankAccount = {...bankAccount};

        if (updatedBankAccount.cardNo !== currentBankAccount.cardNo) {
            let {rows: existedBankAccounts} = await this.findAndCountAllWithUserStatus({
                cardInfo: {
                    bankId: bankAccount.bankId,
                    cardNo: bankAccount.cardNo
                }
            }, [USER_STATUS.OPEN, USER_STATUS.SUSPENDED]);
            if (existedBankAccounts.length > 0) {
                throw new ClientError("Th??? ng??n h??ng ???? ???????c ????ng k?? tr??n h??? th???ng, vui l??ng s??? d???ng th??? kh??c");
            }
        }

        if (updatedBankAccount.bankId !== currentBankAccount.bankId) {
            const existedBank = await service.user.bankAccount.findOne({
                bankId: bankAccount.bankId,
                uid: bankAccount.uid
            });
            if (existedBank) {
                throw new ClientError("B???n ch??? c?? th??? ????ng k?? m???t t??i kho???n tr??n m???i ng??n h??ng, vui l??ng ch???n ng??n h??ng kh??c ho???c x??a th??? hi???n c??");
            }
        }

        if (!isAdmin) {
            await this.checkWdlRequests(updatedBankAccount.id, [REQUEST_STATUS.PENDING, REQUEST_STATUS.RECEIVED, REQUEST_STATUS.RESOLVED]);
            updatedBankAccount = ctx.helper.omit(updatedBankAccount, ['bankId', 'cardName']);
        }

        await ctx.model.User.BankAccount.update({
            ...ctx.helper.removeNullableKeyFrom(updatedBankAccount),
        }, {
            where: ctx.helper.removeNullableKeyFrom(
                {
                    id: updatedBankAccount.id,
                    uid: !isAdmin ? ctx.user.id : null
                },
            ),
        });

        return ctx.model.User.BankAccount.findByPk(bankAccount.id);
    }

    async deleteById(id: string) {
        const {ctx} = this;

        await this.checkSuspendedCloseStatus();

        const isAdmin = [ROLE.MANAGER, ROLE.OPERATOR].includes(ctx.user.role.name);
        if (!isAdmin) {
            await this.checkWdlRequests(id, [REQUEST_STATUS.PENDING, REQUEST_STATUS.RECEIVED, REQUEST_STATUS.RESOLVED]);
        }

        return ctx.model.User.BankAccount.destroy({
            where: ctx.helper.removeNullableKeyFrom(
                {
                    id: id,
                    uid: !isAdmin ? ctx.user.id : null,
                },
            ),
        });
    }

    async checkSuspendedCloseStatus() {
        const {ctx} = this;

        const user = await this.service.user.findByPk(ctx.user.id, {
            rejectOnEmpty: true,
        });

        if (user.status === USER_STATUS.SUSPENDED) {
            throw new ClientError('T??i kho???n c???a b???n ???? b??? ng???ng t???m th???i, kh??ng th??? th???c hi???n thao t??c n??y, vui l??ng li??n h??? k??? thu???t vi??n ????? h??? tr???', 400);
        }
    }

    async checkWdlRequests(bankAccountId: string, statusArr: string[]) {
        const {ctx} = this;

        const pendingWdlRequests = await ctx.service.request.findAll({
            uid: ctx.user.id,
            type: REQUEST_TYPE.WITHDRAW,
            status: {
                [ctx.Op.or]: statusArr
            }
        }, {raw: false});

        const bankAccountWdlRequest = pendingWdlRequests.find(request => request.data.bankAccountId === bankAccountId);
        if (bankAccountWdlRequest) {
            throw new ClientError("Th??? ng??n h??ng ???? ???????c d??ng ????? th???c hi???n m???t y??u c???u r??t ti???n th??nh c??ng ho???c ??ang ???????c th???c hi???n y??u c???u r??t ti???n. Kh??ng th??? x??a, ch???nh s???a th??ng tin. Vui l??ng li??n h??? ?????i ng?? ch??m s??c kh??ch h??ng ????? ???????c x??? l??.");
        } else {
            return null;
        }
    }

    async checkBankAccountName(bankAccountName, userFullName) {
        const userFullNameRemovedAccents = userFullName?.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/??/g, 'd').replace(/??/g, 'D')
            .toUpperCase();

        if (bankAccountName !== userFullNameRemovedAccents) {
            throw new ClientError("T??n t??i kho???n ng??n h??ng kh??ng tr??ng v???i t??n ng?????i d??ng, vui l??ng ki???m tra l???i");
        }

        return true;
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = BankAccountService;
