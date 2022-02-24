'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {ROLE} from "@/constants";

/** Import ES6 Default Dependencies !*/
import {has} from "lodash";

export default class UserController extends BaseController {

    async getUser() {
        const {ctx, service} = this;

        return this.catch(async () => {
            const userInfo = await service.user.findUserByUid(ctx.user.id);
            return {
                userInfo: ctx.helper.omit({
                    ...userInfo,
                    hasWithdrawalPassword: !!userInfo?.withdrawalPassword,
                }, ['withdrawalPassword', 'token'])
            };
        }, {
            errorCode: 2,
        });
    }

    async logout() {
        const {ctx} = this;
        ctx.logout && ctx.logout();
        return this.response({
            msg: 'Đã đăng xuất',
        });
    }

    async getCreditInfo() {
        const {ctx, service} = this;
        if (ctx.user.role?.name === ROLE.MEMBER && ctx.query.uid) {
            return ctx.throw(300, new ClientError("Unauthorized - Chứng thực thất bại"));
        }

        const uid = ctx.query.uid || ctx.user.id;

        return this.catch(async () => {
            const credit = await service.credit.getAvailableCredit(uid);

            return {
                creditInfo: credit,
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 3,
        });
    }

    /** - Authorization success callback method !*/
    async passportSuccessCallback() {
        const {ctx, config} = this;
        const user = ctx.user || {};
        const url = config.passportGithub?.redirectURL || '/';
        ctx.redirect(`${url}?token=${user.token}`);
    }

    /** - Login via token !*/
    async accessToken() {
        const {ctx} = this;
        const token = ctx.query.token;
        if (!token) {
            return ctx.throw(400, new ClientError("Unauthorized - Chứng thực thất bại"));
        }
        const user = await ctx.service.user.findUserByToken(token);

        if (!user) {
            return ctx.throw(400, new ClientError("Unauthorized - Chứng thực thất bại"));
        }

        return this.response({
            userInfo: ctx.helper.omit({
                ...user,
                hasWithdrawalPassword: !!user.withdrawalPassword,
            }, ['withdrawalPassword'])
        });
    }

    /** - Update User Information !*/
    async updateUser() {
        const {ctx} = this;

        this.validate({
            fullName: {type: 'string?', trim: true},
            email: {type: 'string?', trim: true},
            phoneNumber: {type: 'string?', trim: true},
            date: {type: 'string?', trim: true},
            dateOfBirth: {type: 'string?', trim: true},
            ottType: {type: 'string?', trim: true},
            ottAddress: {type: 'string?', trim: true},
            avatarUrl: {type: 'string?', trim: true},
        });

        /**
         ** Prevent [MEMBER, OPERATOR] updating status or email verified status by self
         **/
        if ([ROLE.MEMBER, ROLE.OPERATOR].includes(ctx.user.role.name)
            && has(ctx.request.body, ['status', 'emailVerified'])
        ) {
            return this.response({
                errorCode: 400,
            });
        }

        const uid = ctx.user.id;

        const userInfo = await ctx.service.user.findUserByUid(uid);

        if (!userInfo) {
            return ctx.throw(300, new ClientError("Unauthorized - Chứng thực thất bại"));
        }

        return this.catch(async () => {
            await ctx.service.user.updateUser(uid, {
                ...ctx.params,
            });

            /* Update ctx.user */
            if (ctx.user.role?.name === 'MEMBER') {
                await ctx.login(userInfo);
            }

            return ({
                userInfo: userInfo,
            });
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 5,
            rethrow: true,
        });
    }

    /**
     ** - Used for [MANAGER, OPERATOR] update MEMBER information
     **/
    async forceUpdateUser() {
        const {ctx, service} = this;

        this.validate({
            uid: {type: 'string'},
            /** Admin update users personal information */
            fullName: {type: 'string?', trim: true},
            email: {type: 'string?', trim: true},
            phoneNumber: {type: 'string?', trim: true},
            ottType: {type: 'string?', trim: true},
            ottAddress: {type: 'string?', trim: true},
            /** Admin reset MEMBER withdrawal password */
            withdrawalPassword: {type: 'string?', trim: true},
            confirmWithdrawalPassword: {type: 'string?', trim: true},
            /** Admin update email verified status of MEMBER */
            emailVerified: {type: 'boolean?'},
            /** Admin update status MEMBER */
            status: {type: 'string?', trim: true},
        });

        const {uid} = ctx.params;

        const userInfo = await service.user.findUserByUid(uid);

        return this.catch(async () => {
            await ctx.service.user.updateUser(uid, {
                ...ctx.params,
            });

            return {
                userInfo: userInfo,
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 5,
            rethrow: true,
        });
    }

    async updateUserPassword() {
        const {ctx} = this;
        const uid = ctx.user.id;

        this.validate({
            curPassword: {type: 'string'},
            newPassword: {type: 'string'},
            confirmPassword: {type: 'string'},
        });

        const {
            curPassword,
            newPassword,
            confirmPassword,
        } = ctx.params;

        const curPasswordHashed = ctx.crypto.MD5(curPassword.trim()).toString();
        const newPasswordHashed = ctx.crypto.MD5(newPassword.trim()).toString();

        const user = await ctx.service.user.findUserByUid(uid, {
            attributes: {
                exclude: [],
            },
        });
        if (!user) {
            return this.response({
                errorCode: 2,
            });
        }

        if (curPassword.trim() === newPassword.trim()) {
            return ctx.throw(400, new ClientError("Mật khẩu mới không được giống mật khẩu cũ"));
        }

        if (newPassword.trim() !== confirmPassword.trim()) {
            return ctx.throw(400, new ClientError("Mật khẩu xác nhận không khớp"));
        }

        if (user.password !== curPasswordHashed) {
            return ctx.throw(400, new ClientError("Mật khẩu hiện tại không đúng"));
        }

        if (user.withdrawalPassword === newPasswordHashed) {
            throw new ClientError("Mật khẩu đăng nhập không được giống với mật khẩu rút tiền", 400);
        }

        /** Đổi mật khẩu cập nhật side-effect generate token mới và đá user cũ ra khỏi session */
        return this.catch(async () => {
            await ctx.service.user.updateUser(uid, {
                password: newPasswordHashed,
                token: Buffer.from(`${user.username}:${newPassword}`).toString('base64'),
            });
            return ctx.logout();
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 5,
        });
    }

    async updateUserPassword2() {
        const {ctx} = this;
        const uid = ctx.user.id;

        const {
            curPassword2,
            newPassword2,
            confirmPassword2,
        } = ctx.params;

        this.validate({
            curPassword2: {type: 'string'},
            newPassword2: {type: 'string'},
            confirmPassword2: {type: 'string'},
        });

        const curPassword2Hashed = ctx.crypto.MD5(curPassword2.trim()).toString();
        const newPassword2Hashed = ctx.crypto.MD5(newPassword2.trim()).toString();

        const user = await ctx.service.user.findUserByUid(uid, {
            attributes: {
                exclude: [],
            },
        });
        if (!user) {
            return this.response({
                errorCode: 2,
            });
        }

        if (curPassword2.trim() === newPassword2.trim()) {
            return ctx.throw(400, new ClientError("Mật khẩu mới không được giống mật khẩu cũ"));
        }

        if (newPassword2.trim() !== confirmPassword2.trim()) {
            return ctx.throw(400, new ClientError("Xác nhận mật khẩu không khớp"));
        }

        if (user.password === newPassword2Hashed) {
            return ctx.throw(400, new ClientError("Mật khẩu 2 không được giống mật khẩu đăng nhập"));
        }

        if (user.password2 !== curPassword2Hashed) {
            return ctx.throw(400, new ClientError("Mật khẩu 2 hiện tại không đúng"));
        }

        return this.catch(async () => {
            await ctx.service.user.updateUser(uid, {
                password2: newPassword2Hashed,
            });
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 5,
        });
    }

    async updateUserWithdrawalPassword() {
        const {ctx} = this;
        const uid = ctx.user.id;

        this.validate({
            curPassword: {type: 'string'},
            newWithdrawalPassword: {type: 'string'},
            confirmWithdrawalPassword: {type: 'string'},
        });

        const {
            curPassword,
            newWithdrawalPassword,
            confirmWithdrawalPassword,
            isFirstWithdrawalPassword
        } = ctx.params;

        const curPasswordHashed = ctx.crypto.MD5(curPassword.trim()).toString();
        const newWithdrawalPasswordHashed = ctx.crypto.MD5(newWithdrawalPassword.trim()).toString();

        const user = await ctx.service.user.findUserByUid(uid, {
            attributes: {
                exclude: [],
            },
        });
        if (!user) {
            return this.response({
                errorCode: 2,
            });
        }

        if (isFirstWithdrawalPassword) {
            if (user.password !== curPasswordHashed) {
                return ctx.throw(400, new ClientError("Mật khẩu đăng nhập không đúng"));
            }
            if (curPassword.trim() === newWithdrawalPassword.trim()) {
                return ctx.throw(400, new ClientError("Mật khẩu rút tiền mới không được giống với mật khẩu đăng nhập"));
            }
        } else {
            if (curPassword.trim() === newWithdrawalPassword.trim() || user.password === newWithdrawalPasswordHashed) {
                return ctx.throw(400, new ClientError("Mật khẩu rút tiền mới không được giống với mật khẩu rút tiền cũ hoặc mật khẩu đăng nhập"));
            }
            if (user.withdrawalPassword !== curPasswordHashed) {
                return ctx.throw(400, new ClientError("Mật khẩu rút tiền hiện tại không đúng"));
            }
        }

        if (newWithdrawalPassword.trim() !== confirmWithdrawalPassword.trim()) {
            return ctx.throw(400, new ClientError("Mật khẩu xác nhận không khớp"));
        }

        return this.catch(async () => {
            await ctx.service.user.updateUser(uid, {
                withdrawalPassword: newWithdrawalPassword,
                confirmWithdrawalPassword: confirmWithdrawalPassword,
                // token: Buffer.from(`${user.username}:${newPassword}`).toString('base64'),
            });
            return ctx.logout();
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 5,
            rethrow: true,
        });
    }

    async registerLocalUser() {
        const {ctx} = this;

        this.validate({
            username: {type: 'string', trim: true},
            password: {type: 'string', trim: true},
            password2: {type: 'string?', trim: true},
            fullName: {type: 'string', trim: true},
            email: {type: 'string', trim: true},
            phoneNumber: {type: 'string', trim: true},
            dateOfBirth: {type: 'string', trim: true},
            ottType: {type: 'string', trim: true},
            ottAddress: {type: 'string?', trim: true},
            referralCode: {type: 'string?', default: '', trim: true},
        });

        const {password, password2} = ctx.params;

        return this.catch(async () => {
            const userInfo = await ctx.service.user.registerLocal({
                ...ctx.params.permit([
                    'username',
                    'password',
                    'password2',
                    'fullName',
                    'email',
                    'phoneNumber',
                    'referralCode',
                    'dateOfBirth',
                    'ottAddress',
                ]),
                password: ctx.crypto.MD5(password).toString(),
                password2: ctx.crypto.MD5(password2).toString(),
            });
            return {
                msg: 'Đăng kí thành công',
                userInfo: userInfo,
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            rethrow: true,
        });
    }

    async createOperator() {
        const {ctx} = this;

        this.validate({
            username: {type: 'string', trim: true},
            password: {type: 'string', trim: true},
            fullName: {type: 'string', trim: true},
        });

        const {username, password, fullName} = ctx.params;

        const user = {
            username,
            fullName,
            /** Default generated email */
            email: `${username.toLowerCase()}@v3t.io`,
            phoneNumber: `+84${Date.now()}`,
            dateOfBirth: '1968-08-06',
            ottType: 'TELEGRAM',
            ottAddress: `${username.toLowerCase()}_v3t`,
            password: ctx.crypto.MD5(password).toString(),
            password2: '',
            emailVerified: 1,
        };

        return this.catch(async () => {
            const userInfo = await ctx.service.user.registerLocal(user);
            return {
                msg: 'Đăng kí thành công',
                userInfo: userInfo,
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            rethrow: true,
        });
    }


    /**
     ** - Kiểm tra Referral Code nhập vào form đăng kí có tồn tại hay không.
     ** @returns {Promise<boolean | void>}
     **/
    async verifyReferralCode() {
        const {ctx, service} = this;

        this.validate({
            referralCode: {type: 'string', convertType: 'string', default: '', trim: true},
            exclude: {type: 'array?', itemType: 'string'},
        });

        const {exclude, referralCode} = ctx.params;

        return this.catch(async () => {
            const referrer = await service.user.findUserByReferralCode(referralCode, exclude);

            if (!referrer) {
                return ctx.throw(400, new ClientError("Mã giới thiệu không tồn tại"));
            }

            return referrer;
        }, {
            /* [[Optional Attributes Placeholder]] */
            rethrow: true,
        });
    }

    /**
     ** - Kiểm tra Username nhập vào form đăng kí có tồn tại hay không.
     ** @returns {Promise<boolean | void>}
     **/
    async verifyUsername() {
        const {ctx, service} = this;

        this.validate({
            username: {type: 'string', trim: true},
        });

        return this.catch(async () => {
            const user = await service.user.findByUsername(ctx.params.username.trim());

            if (!user) {
                return true;
            }

            return ctx.throw(400, new ClientError("Tên đăng nhập đã tồn tại"));
        }, {
            /* [[Optional Attributes Placeholder]] */
            rethrow: true,
        });
    }

    /**
     ** - Kiểm tra Phone Number nhập vào form đăng kí có tồn tại hay không.
     ** @returns {Promise<boolean | void>}
     **/
    async verifyPhoneNumber() {
        const {ctx, service} = this;

        this.validate({
            phoneNumber: {type: 'string', trim: true},
            exclude: {type: 'array?', itemType: 'string'},
        });

        const {exclude} = ctx.request.body;

        return this.catch(async () => {
            const user = await service.user.findByPhoneNumber(ctx.params.phoneNumber.trim(), exclude);

            if (!user) {
                return true;
            }

            return ctx.throw(400, new ClientError("Số điện thoại đã tồn tại"));
        }, {
            /* [[Optional Attributes Placeholder]] */
            rethrow: true,
        });
    }

    /**
     ** - Kiểm tra Email nhập vào form đăng kí có tồn tại hay không.
     ** @returns {Promise<boolean | void>}
     **/
    async verifyEmail() {
        const {ctx, service} = this;

        this.validate({
            email: {type: 'string', trim: true},
            exclude: {type: 'array?', itemType: 'string'}
        });

        const {exclude} = ctx.params;

        return this.catch(async () => {
            const user = await service.user.findByEmail(ctx.params.email.trim(), exclude);

            if (!user) {
                return true;
            }

            return ctx.throw(400, new ClientError("Email này đã tồn tại"));
        }, {
            /* [[Optional Attributes Placeholder]] */
            rethrow: true,
        });
    }

    /**
     ** Get list user
     ** @returns {Promise<void>}
     **/
    async findAndCountAll() {
        const {ctx, service} = this;

        this.validate({
            role: {type: 'string?'},
            username: {type: 'string?'},
            email: {type: 'string?'},
            phoneNumber: {type: 'string?'},
            ottAddress: {type: 'string?'},
            referrerId: {type: 'string?'},
        });

        const {pageNo, pageSize} = ctx.params;

        return this.catch(async () => {
            return service.user.findAndCountAll({
                ...ctx.helper.extractPagingProps({pageSize, pageNo}),
                ...ctx.params.permit([
                    'startDate',
                    'endDate',
                    /** Filters */
                    'username',
                    'email',
                    'phoneNumber',
                    'ottAddress',
                    'role',
                    'referrerId',
                ]),
            });
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 2,
        });
    }

    async getHistory() {
        const {ctx, service} = this;

        this.validate({
            uid: {type: 'string?'},
            username: {type: 'string?'},
            updatedBy: {type: 'string?', default: ''},
        });

        const {pageNo, pageSize} = ctx.params;

        return this.catch(async () => {
            return service.user.findAndCountAllHistory({
                ...ctx.helper.extractPagingProps({pageSize, pageNo}),
                ...ctx.params.permit('startDate', 'endDate', 'uid', 'username', 'updatedBy'),
            });
        }, {
            errorCode: 2,
        });
    }

    async getLoginHistory() {
        const {ctx, service} = this;

        this.validate({
            uid: {type: 'string?'},
            username: {type: 'string?'},
        });

        const {pageNo, pageSize} = ctx.params;

        return this.catch(async () => {
            return service.user.findAndCountAllLoginHistory({
                ...ctx.helper.extractPagingProps({pageSize, pageNo}),
                ...ctx.params.permit('uid', 'username', 'startDate', 'endDate'),
            });
        }, {
            errorCode: 2,
        });
    }

    async updateBalanceManual() {
        const {ctx} = this;

        this.validate({
            uid: {type: 'string'},
            type: {type: 'string'},
            amount: {type: 'number'},
            note: {type: 'string', trim: true},
        });

        return this.catch(async () => {
            await ctx.service.user.updateBalanceManual({
                ...ctx.params.permit('uid', 'type', 'amount', 'note'),
            });
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 5,
            rethrow: true,
        });
    }

}

module.exports = UserController;
