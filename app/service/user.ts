/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

/** Import Core Dependencies !*/
import {BaseService} from "@/extend/class";

/** Import Utils !*/
import {Referral} from "@/utils";
/** Import ENUMS & CONSTANTS !*/
import {MESSAGE_TYPE, ROLE, USER_STATUS, LOGIN_LOG_TYPE} from "@/constants";

/** Import ES6 Default Dependencies !*/
import {UAParser} from "ua-parser-js";
/** Import User Level Service !*/
import UserLevelService from "./user/level";
/** Import Bank Account Service !*/
import BankAccountService from "./user/bank_account";
/** Import Reset Password Service !*/
import ResetPasswordService from "./user/password/reset";
/** Import Virtual Wallet Service !*/
import VirtualWalletService from "./user/virtual_wallet";
/** Import Email Verification Service !*/
import EmailVerificationService from "./user/email_verification";

/** Import Pre-Defined Types Helper !*/
import type {PlainObject} from "@/extend/types";
/** Sequelize QUERIES OPTION INTERFACES !*/
import type {FindOptions} from "sequelize/types";

/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/user";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";

export declare interface IUserMonthlySettlementReport {
    user: Pick<IUserAttributes, 'id' | 'username' | 'referrerId'>;
    /** Đơn vị tiền [VNĐ] !*/
    totalTurnover: number;
    /** Đơn vị tiền [VNĐ] !*/
    totalNetTurnover: number;
    /** Đơn vị tiền [VNĐ] !*/
    totalWinloss: number;
    fromDate: 'YYYY-MM' | string;
    toDate: 'YYYY-MM' | string;
}

export default class UserService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.User;
        BaseService.safeLazyNestedPropertyInject(this, 'password', {
            reset: ResetPasswordService,
        });
        BaseService.safeLazyPropertyInject(this, 'level', UserLevelService);
        BaseService.safeLazyPropertyInject(this, 'bankAccount', BankAccountService);
        BaseService.safeLazyPropertyInject(this, 'virtualWallet', VirtualWalletService);
        BaseService.safeLazyPropertyInject(this, 'emailVerification', EmailVerificationService);
    }

    /**
     ** - Register member user
     ** @param {PlainObject} user
     **/
    async registerLocal(user: PlainObject) {
        const {app, ctx, service} = this;

        const {
            username,
            fullName,
            email,
            phoneNumber,
            dateOfBirth,
            password,
            password2,
            referralCode,
        } = user;

        /** Role of that user will be created below belong to */
        let createUserAsRole = ROLE.MEMBER;

        /** - Step 1.0 Validate permission */
        if (ctx.user) {
            if ([ROLE.MEMBER, ROLE.OPERATOR].includes(ctx.user.role.name)) {
                ctx.print = {
                    errorCode: 403,
                };
                return;
            }

            /** Manager create Operators */
            createUserAsRole = ROLE.OPERATOR;
        }

        /** - Step 1.1 Validate referral code */
        let referrer;
        if (referralCode) {
            referrer = await service.user.findUserByReferralCode(referralCode);
            if (!referrer) {
                ctx.print = {errorCode: 2, msg: 'Mã giới thiệu không hợp lệ'};
                return Promise.reject('Invalid referral code');
            }
        }

        /** - Step 1.2 Validate user role */
        const role = await service.role.findRoleByName(createUserAsRole);
        if (!role) {
            ctx.print = {
                errorCode: 400,
            };
            return Promise.reject('Invalid role');
        }

        /** - Step 1.3 Validate username */
        const existsUser = await service.user.findByUsername(username);
        if (existsUser) {
            ctx.print = {
                errorCode: 400,
                msg: 'Username đã tồn tại'
            };
            return Promise.reject('Username is already taken');
        }

        /** - Step 1.4 Validate email */
        const existsEmail = await service.user.findByEmail(email);
        if (existsEmail) {
            ctx.print = {
                errorCode: 400,
                msg: 'Email đã được sử dụng'
            };
            return Promise.reject('Email is already taken');
        }

        /** - Step 1.5 Validate phone number */
        const existsPhoneNumber = await service.user.findByEmail(phoneNumber);
        if (existsPhoneNumber) {
            ctx.print = {
                errorCode: 400,
                msg: 'Số điện thoại đã được sử dụng'
            };
            return Promise.reject('Phone number is already taken');
        }

        /** - Step 1.6 Validate password & password 2 */
        if (password === password2) {
            ctx.print = {
                errorCode: 400,
                msg: 'Mật khẩu 2 phải khác mật khẩu đăng nhập'
            };
            return Promise.reject('Password 2 must be different from login password');
        }

        /** Get member role id */
        const roleId = role.id;

        /** Get levelId */
        const defaultUserLevel = await service.user.level.findLowestLevel();
        const levelId = defaultUserLevel.id;

        /** Get referrerId */
        const referrerId = referralCode ? referrer.id : null;

        /** Get default user's referral code */
        const userReferralCode = Referral.getUniqueCode();

        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            const [userRes] = await Promise.all([
                ctx.model.User.create({
                    username,
                    fullName,
                    email,
                    phoneNumber,
                    password, // hashed
                    password2, // hashed
                    dateOfBirth,
                    roleId,
                    levelId,
                    referrerId,
                    referralCode: userReferralCode,
                    emailVerified: createUserAsRole === ROLE.OPERATOR,
                }, {transaction: tx}),
            ]);

            /**
             ** Auto create all table row related to user
             ** Can move these stuffs to afterCreate hook of model User
             **/
            const [/*mail*/, /*message*/, /*credit*/, /*levelLog*/] = await Promise.all([
                service.mail.register(userRes),
                service.message.create({uid: userRes.id, ...MESSAGE_TYPE.system.welcome}, {transaction: tx}),
                service.credit.create(userRes.id, {transaction: tx}),
                service.user.level.log.create({
                    uid: userRes.id,
                    levelId: levelId,
                }, {transaction: tx}),
            ]);
            return userRes;
        });
    }

    /**
     ** - Find user by username
     ** @param {string} username
     ** @returns {Promise}
     **/
    async findByUsername(username: string) {
        const {ctx} = this;
        return ctx.model.User.findOne({
            attributes: {
                exclude: ['password', 'password2']
            },
            where: {
                username: username.toLowerCase(),
            },
            raw: true,
        });
    }

    /**
     ** - Find user by phone number
     ** @param {string} phoneNumber
     ** @param {Array<string>} [exclude]
     ** @returns {Promise}
     **/
    async findByPhoneNumber(phoneNumber: string, exclude?: Array<string>) {
        const {ctx} = this;
        const where = {phoneNumber: phoneNumber.toLowerCase()};

        if (exclude && exclude.includes(phoneNumber.toLowerCase())) {
            return Promise.resolve(null);
        }
        return ctx.model.User.findOne({
            attributes: {
                exclude: ['password', 'password2']
            },
            where: where,
            raw: true,
        });
    }

    /**
     ** - Find user by email
     ** @param {string} email
     ** @param {Array<string>} [exclude]
     ** @returns {Promise}
     **/
    async findByEmail(email: string, exclude?: Array<string>) {
        const {ctx} = this;
        const where = {email: email.toLowerCase()};

        if (exclude && exclude.includes(email.toLowerCase())) {
            return Promise.resolve(null);
        }
        return ctx.model.User.findOne({
            attributes: {
                exclude: ['password', 'password2']
            },
            where: where,
            raw: true,
        });
    }

    /**
     ** - Account password login via egg-passport
     ** @param {PlainObject} data
     ** @returns {Promise<PlainObject | null>}
     **////<reference types="egg-passport"/>
    async findUserByLocal(data: PlainObject) {
        const {ctx} = this;
        return ctx.model.User.findOne({
            where: {
                username: data.username.toLowerCase(),
            },
            include: [{
                model: ctx.model.Role,
                as: 'role',
                attributes: ['id', "name"],
            }, {
                model: ctx.model.User.Level,
                as: 'level',
                attributes: ['id', "name"],
            }],
            raw: true,
            nest: true,
        });
    }

    /**
     ** - Find users by user ID
     ** @param {string} uid
     ** @param {BaseService.FindOptions} [options]
     ** @returns {Promise}
     **/
    async findUserByUid(uid: string, options?: BaseService["FindOptions"]) {
        const {ctx} = this;
        return ctx.model.User.findOne({
            attributes: {
                exclude: ['password', 'password2']
            },
            where: {id: uid},
            include: [{
                model: ctx.model.Role,
                as: 'role',
                attributes: ['id', "name"],
            }, {
                model: ctx.model.User.Level,
                as: 'level',
                attributes: ['id', "name"],
            }],
            raw: true,
            nest: true,
            ...options,
        });
    }

    /**
     ** - Find users by token
     ** @param {string} token
     ** @returns {Promise}
     **/
    async findUserByToken(token: string) {
        const {ctx} = this;
        return ctx.model.User.findOne({
            attributes: {
                exclude: ['password', 'password2'],
            },
            where: {token},
            include: ['role', 'credit'],
            raw: true,
            nest: true,
        });
    }

    /**
     ** - Return user by referral code
     ** @param {string} referralCode
     ** @param {Array<string>} [exclude]
     ** @returns {Promise}
     **/
    async findUserByReferralCode(referralCode: string, exclude?: Array<string>) {
        const {ctx} = this;

        if (exclude && exclude.includes(referralCode.toUpperCase())) {
            return Promise.resolve(null);
        }
        return ctx.model.User.findOne({
            attributes: ['id', 'username', 'fullName'],
            where: {referralCode: referralCode.toUpperCase(), status: USER_STATUS.OPEN},
        });
    }

    /**
     ** - Update user information by user ID
     ** @param {number} uid
     ** @param {Object} data
     ** @param {boolean} [individualHooks]
     ** @returns {Promise}
     ** @ts-ignore ~!*/
    async updateUser(uid: string, data: PlainObject, individualHooks = false) {
        const {ctx, app, service} = this;

        const user = await service.user.findByPk(uid, {
            rejectOnEmpty: true,
        });

        if (data?.status) {
            /** Only run before/after hook when user status changed
             ** Check if status have already changed ~!*/
            individualHooks = true;
            switch (data.status) {
                case user.status:
                    throw new ClientError(`Trạng thái của thành viên hiện tại đã ${user.status === USER_STATUS.OPEN ? 'MỞ' : user.status === USER_STATUS.SUSPENDED ? 'NGỪNG' : 'ĐÓNG'}, vui lòng tải lại trang để cập nhật`, 400);

                case USER_STATUS.OPEN:
                    /** Check if user's bank accounts is duplicated with other users */
                    const userBankAccounts = await service.user.bankAccount.findAllByUid(uid);
                    const userVirtualWallets = await service.user.virtualWallet.findAllByUid(uid);
                    const cardInfoArr = userBankAccounts.map(bankAccount => {
                        return {bankId: bankAccount.bankId, cardNo: bankAccount.cardNo};
                    });
                    const payIdArr = userVirtualWallets.map(wallet => wallet.payId);


                    const {rows: activeBankAccounts} = await service.user.bankAccount.findAndCountAllWithUserStatus({cardInfo: cardInfoArr}, [USER_STATUS.OPEN, USER_STATUS.SUSPENDED]);
                    const {rows: activeVirtualWallets} = await service.user.virtualWallet.findAndCountAllWithUserStatus({payIdArr: payIdArr}, [USER_STATUS.OPEN, USER_STATUS.SUSPENDED]);

                    const bankAccountOwnerNameArr = activeBankAccounts
                        .filter(row => row.uid !== uid)
                        .map(el => el?.user?.username + '-' + el?.cardNo);
                    const virtualWalletOwnerNameArr = activeVirtualWallets
                        .filter(row => row.uid !== uid)
                        .map(el => el?.user?.username + '-' + el?.payId);

                    if (bankAccountOwnerNameArr.length > 0) {
                        throw new ClientError(`Thành viên đang có một tài khoản ngân hàng đang được sử dụng bởi thành viên khác (${bankAccountOwnerNameArr.join(',')})`, 400);
                    }
                    if (virtualWalletOwnerNameArr.length > 0) {
                        throw new ClientError(`Thành viên đang có một ví điện tử đang được sử dụng bởi thành viên khác (${virtualWalletOwnerNameArr.join(',')})`, 400);
                    }

                    /** Clear loginFailed & withdrawalPasswordFailed tries */
                    data.loginFailed = app.Sequelize.literal('0');
                    data.withdrawalPasswordFailed = app.Sequelize.literal('0');
                    break;
                case USER_STATUS.CLOSED:
                    /** Get User Redis Client from ``${config/config.default.js}`` and kick user out*/
                    const userClient = app.redis.get('user');
                    await userClient.del(user.username as string);
                    break;
                default:
                    break;
            }

            /** Check if user's bank accounts is duplicated with other users */
        }

        if (data?.withdrawalPassword) {
            /** The two passwords should has the same value !*/
            if (data?.withdrawalPassword?.trim() !== data?.confirmWithdrawalPassword?.trim()) {
                throw new ClientError("Mật khẩu rút tiền không khớp", 400);
            }

            const hashedWithdrawalPassword = ctx.crypto.MD5(data?.withdrawalPassword.trim()).toString();

            if (hashedWithdrawalPassword === user.password) {
                throw new ClientError("Mật khẩu rút tiền không được trùng với mật khẩu đăng nhập", 400);
            }

            data.withdrawalPassword = hashedWithdrawalPassword;
        }

        if (!data?.status) {
            data.infoLastModified = Date.now();
        }

        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;
        const result = await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            const updateRecord = await ctx.model.User.update(ctx.helper.removeNullableKeyFrom(data), {
                where: {id: uid},
                individualHooks: individualHooks,
                transaction: tx,
                user: ctx.user,
                message: data.message,
            });

            switch (data.status) {
                case USER_STATUS.SUSPENDED:
                    await ctx.service.message.create({
                        title: MESSAGE_TYPE.system.suspend.title,
                        type: MESSAGE_TYPE.system.suspend.type,
                        content: `Tài khoản đã bị tạm ngừng bởi quản trị viên.  
                    Lý do: ${data.message}  
                    Bạn sẽ không thể thao tác tạo yêu cầu (bơm/rút điểm, nạp/rút tiền, tạo TK cược,...).  
                    Vui lòng liên hệ KTV để được hỗ trợ`,
                        uid: user.id,
                        showPopup: true,
                        importanceLevel: 4,
                    }, {transaction: tx});
                    break;

                case USER_STATUS.OPEN:
                    if (user.status === USER_STATUS.CLOSED) {
                        break;
                    }

                    await ctx.service.message.create({
                        title: MESSAGE_TYPE.system.reopen.title,
                        type: MESSAGE_TYPE.system.reopen.type,
                        content: `Tài khoản đã được mở lại.  
                    Ghi chú: ${data.message}  
                    Vui lòng liên hệ KTV nếu cần hỗ trợ thêm`,
                        uid: user.id,
                        showPopup: false,
                        importanceLevel: 4,
                    }, {transaction: tx});

                    //Disable Popup of previous suspend notifications
                    await ctx.service.message.update({
                        showPopup: false,
                    }, {
                        uid: user.id,
                        type: MESSAGE_TYPE.system.suspend.type
                    }, {transaction: tx});
                    break;

                default:
                    break;
            }

            return updateRecord;
        });

        await ctx.reload(true);
        return result;
    }

    /**
     ** - Find user email by uid
     ** @param {string | Array<string>} uid
     ** @returns {Promise}
     **/
    async findEmailByUid(uid: string | Array<string>) {
        const {ctx} = this;
        return ctx.model.User.findAll({
            attributes: ['email'],
            where: {
                id: Array.isArray(uid) ? {
                    [ctx.Op.in]: uid,
                } : uid,
            },
            raw: true,
        });
    }

    /**
     ** @param {Object} options
     ** @returns {Promise}
     ** @ts-ignore ~!*/
    async findAndCountAll<TOptions extends FindOptions<IAttributes>>(
        options?: Partial<{
            username: string;
            email: string;
            phoneNumber: string;
            ottAddress: string;
            startDate: string;
            endDate: string;
            referrerId: string;
            role: string;
        }> & TOptions,
    ) {
        const {ctx, app} = this;

        return ctx.model.User.findAndCountAll({
            ...ctx.helper.omit({...options}, ['where']),
            where: {
                [ctx.Op.and]: [
                    options?.startDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('user.created_at')),
                        '>=',
                        options.startDate,
                    ) : null,
                    options?.endDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('user.created_at')),
                        '<=',
                        options.endDate,
                    ) : null,
                    /** Filter by username */{
                        username: {
                            [ctx.Op.like]: options?.username ? ('%' + options?.username + '%') : '%'
                        },
                        email: {
                            [ctx.Op.like]: options?.email ? ('%' + options?.email + '%') : '%'
                        },
                        phoneNumber: {
                            [ctx.Op.like]: options?.phoneNumber ? ('%' + options?.phoneNumber + '%') : '%'
                        },
                    },
                    /** Filter by referrer */
                    (ctx.user.role?.name === ROLE.MEMBER ? {referrerId: ctx.user.id} : ctx.helper.removeNullableKeyFrom({referrerId: options?.referrerId}))
                ].filter(ctx.helper.NonNullableOrUndefined),
                ...options?.where,
            },
            include: [{
                model: ctx.model.Role,
                as: 'role',
                attributes: ['id', 'name'],
                /* Filter by role name */
                where: ctx.user.role?.name === ROLE.MEMBER ? {name: ROLE.MEMBER} : ctx.helper.removeNullableKeyFrom({name: options?.role}),
            }, {
                model: ctx.model.Credit,
                as: 'credit',
                attributes: ['balance', 'freeze'],
            }, {
                model: ctx.model.User,
                as: 'referredByUser',
                attributes: ['username'],
                required: false,
            }],
            order: [
                ['username', 'ASC']
            ],
            nest: true,
        });
    }

    /**
     ** - This function will suspend user account via corresponding username.
     ** @param {PlainObject} data
     ** @returns {Promise<number>}
     **/
    async loginFailedHandler<T extends {username: string}>(data: T) {
        const {ctx, app} = this;

        if (!data) {
            throw new ReferenceError("Tham số không hợp lệ");
        }
        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            const user = await ctx.model.User.findOne({
                where: {
                    username: data.username,
                },
                transaction: tx,
            });

            if (!user) {
                return;
            }

            /** Default increment by 1 !*/
            const {loginFailed} = await user.increment(['loginFailed'], {
                transaction: tx,
                benchmark: true,
                logging: (_sql, timing) => {
                    return ctx.helper.Console.trace([
                        `User <--${data.username}--> login failed. Exec: ${timing} ms`,
                    ]);
                },
            });

            /** If updated record [loginFailed] has either [null] or [zero] !*/
            if (!loginFailed && loginFailed !== 0) { // Back-ward compatible to older version.
                /** Manual update & Convert nullable value into Integer !*/
                await ctx.model.User.update({
                    loginFailed: app.Sequelize.literal('IFNULL(login_failed, 0) + 1')
                }, {
                    where: {
                        username: data.username,
                    },
                    transaction: tx,
                });
            }

            /** If updated record [loginFailed] has value bigger than [5] !*/
            if (loginFailed >= 4 && user.status !== USER_STATUS.CLOSED) { // Suspend user after 5 times failed login.
                /** Make sure User Status is [SUSPENDED] !*/
                await ctx.model.User.update({
                    status: USER_STATUS.CLOSED,
                }, {
                    where: {
                        username: data.username,
                    },
                    individualHooks: true,
                    transaction: tx,
                    message: "Sai mật khẩu quá 5 lần",
                });
            }

            return (loginFailed ?? 0) + 1;
        });
    }

    async withdrawalPasswordFailedHandler<T extends {username: string}>(data: T) {
        const {ctx, app} = this;
        const maxAttempts = 3;

        if (!data) {
            throw new ReferenceError("Tham số không hợp lệ");
        }
        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            const user = await ctx.model.User.findOne({
                where: {
                    username: data.username,
                },
                // rejectOnEmpty: true,
                transaction: tx,
            });

            if (!user) return;

            /** Default increment by 1 !*/
            const {withdrawalPasswordFailed} = await user.increment(['withdrawalPasswordFailed'], {
                transaction: tx,
                benchmark: true,
                logging: (_sql, timing) => {
                    return ctx.helper.Console.trace([
                        `User <--${data.username}--> withdrawalPassword failed. Exec: ${timing} ms`,
                    ]);
                },
            });

            /** If updated record [loginFailed] has either [null] or [zero] !*/
            if (!withdrawalPasswordFailed && withdrawalPasswordFailed !== 0) { // Back-ward compatible to older version.
                /** Manual update & Convert nullable value into Integer !*/
                await ctx.model.User.update({
                    withdrawalPasswordFailed: app.Sequelize.literal('IFNULL(withdrawal_password_failed, 0) + 1')
                }, {
                    where: {
                        username: data.username,
                    },
                    transaction: tx,
                });
            }

            /** If updated record [withdrawalPasswordFailed] has value bigger than [3] !*/
            if (withdrawalPasswordFailed >= maxAttempts - 1 && user.status !== USER_STATUS.SUSPENDED) { // Suspend user after 5 times failed login.
                /** Make sure User Status is [SUSPENDED] !*/
                await ctx.model.User.update({
                    status: USER_STATUS.SUSPENDED,
                }, {
                    where: {
                        username: data.username,
                    },
                    individualHooks: true,
                    transaction: tx,
                    ctx: ctx,
                    message: `Sai mật khẩu rút tiền quá ${maxAttempts} lần`,
                });

                await ctx.service.message.create({
                    title: MESSAGE_TYPE.system.suspend.title,
                    type: MESSAGE_TYPE.system.suspend.type,
                    content: `Do sai mật khẩu rút tiền nhiều lần, tài khoản của bạn hiện tại đã bị NGỪNG tạm thời.  
                    Bạn sẽ không thể thao tác tạo yêu cầu (bơm/rút điểm, nạp/rút tiền, tạo TK cược,...).  
                    Vui lòng liên hệ KTV để được hỗ trợ`,
                    uid: user.id,
                    showPopup: true,
                    importanceLevel: 4,
                }, {transaction: tx});
            }

            /** Careful because this ``${afterCommit}`` only run when you pass down Transaction Instance !*/
            await ctx.reload(true, {transaction: tx});

            return (withdrawalPasswordFailed ?? 0) + 1;
        });
    }

    async writeLoginLog<T extends {userId, ip, userAgent, loginStatus}>(data: T) {
        const {ctx} = this;
        const uaParser = new UAParser(data.userAgent);
        /** Log user when login success !*/
        try {
            await ctx.model.User.Login.History.create({
                ip: data.ip,
                uid: data.userId,
                status: data.loginStatus,
                userAgent: data.userAgent,
                device: uaParser.getDevice(),
                browser: uaParser.getBrowser(),
                type: LOGIN_LOG_TYPE.LOGIN,
                os: uaParser.getOS()
            });
        } catch (error) {
            console.error('Cannot save login log due to error:', error);
        }

    }

    /**
     ** - This function will unlock [CLOSED] or [SUSPENDED] user account via corresponding username.
     ** @param {PlainObject} data
     ** @returns {Promise<number>}
     **/
    async unlockUser<T extends {username: string}>(data: T) {
        const {ctx, app} = this;

        if (!data) {
            throw new ReferenceError("Tham số không hợp lệ");
        }
        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.SERIALIZABLE}, async (tx) => {
            /** Set [loginFailed] to [zero] and make sure User Status is [OPEN] !*/
            const [numRecord] = await ctx.model.User.update({
                status: USER_STATUS.OPEN,
                loginFailed: app.Sequelize.literal('0'),
            }, {
                where: {
                    username: data.username,
                },
                transaction: tx,
            });

            return numRecord;
        });
    }

    /**
     ** @param {Object} options
     ** @returns {Promise}
     **/
    async findAndCountAllHistory<TOptions extends Partial<{
        endDate: string;
        startDate: string;
        uid: string;
        username: string;
        updatedBy: string;
    }>>(options: TOptions) {
        const {ctx, app} = this;
        return await ctx.model.User.History.findAndCountAll({
            where: {
                [ctx.Op.and]: [
                    options?.startDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('user_history.created_at')),
                        '>=',
                        options.startDate
                    ) : null,
                    options?.endDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('user_history.created_at')),
                        '<=',
                        options.endDate
                    ) : null,
                ].filter(ctx.helper.NonNullableOrUndefined),
                ...ctx.helper.removeNullableKeyFrom({uid: options?.uid, updatedBy: options?.updatedBy})
            },
            include: [{
                model: ctx.model.User,
                as: 'user',
                attributes: ['id', 'username'],
                where: {
                    username: {[ctx.Op.like]: options?.username ? '%' + options.username + '%' : '%'},
                },
            }, {
                model: ctx.model.User,
                as: 'changedBy',
                attributes: ['id', 'username'],
            }],
            order: [
                ['createdAt', 'DESC']
            ],
            nest: true,
            ...options,
        });
    }

    /**
     ** @param {Object} options
     ** @returns {Promise}
     **/
    async findAndCountAllLoginHistory<TOptions extends Partial<{
        endDate: string;
        startDate: string;
        uid: string;
        username: string;
    }>>(options: TOptions) {
        const {ctx, app} = this;
        return await ctx.model.User.Login.History.findAndCountAll({
            where: {
                [ctx.Op.and]: [
                    options?.startDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('user_login_history.created_at')),
                        '>=',
                        options.startDate
                    ) : null,
                    options?.endDate ? app.Sequelize.where(
                        app.Sequelize.fn('DATE', app.Sequelize.col('user_login_history.created_at')),
                        '<=',
                        options.endDate
                    ) : null,
                ].filter(ctx.helper.NonNullableOrUndefined),
                ...ctx.helper.removeNullableKeyFrom({uid: options?.uid})
            },
            include: [{
                model: ctx.model.User,
                as: 'user',
                attributes: ['id', 'username'],
                where: {
                    username: {[ctx.Op.like]: options?.username ? '%' + options.username + '%' : '%'},
                },
            }],
            order: [
                ['createdAt', 'DESC']
            ],
            nest: true,
            ...options,
        });
    }

    async updateBalanceManual(data: {
        uid: string;
        type: string;
        amount: number;
        note: string;
    }) {
        const {ctx, app, service} = this;
        const {uid, type, amount, note} = data;

        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.READ_COMMITTED}, async (tx) => {
            return Promise.all([
                service.credit.update({balance: amount}, {uid: uid}, {
                    transaction: tx,
                    user: ctx.user,
                    credit: {
                        /** @ts-ignore !*/
                        action: type,
                    },
                    message: note,
                }),
                service.message.create({
                    uid: uid,
                    title: type === "TOP_UP_BALANCE_MANUAL" ? "Cộng số dư ví" : "Trừ số dư ví",
                    content: note,
                }, {
                    transaction: tx,
                })
            ]);
        });
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = UserService;
