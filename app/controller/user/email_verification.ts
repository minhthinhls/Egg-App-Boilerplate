'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
export default class EmailVerificationController extends BaseController {

    /**
     **
     ** @returns {Promise<void>}
     **/
    async sendEmail() {
        const {ctx, service} = this;

        /** Email in Request Body !*/
        this.validate({
            email: {type: 'string?', trim: true},
            username: {type: 'string?', trim: true},
        });

        return this.catch(async () => {
            const result = await service.user.emailVerification.send(ctx.helper.removeNullableKeyFrom({
                ...ctx.request.body,
            }));
            return {
                data: result,
                msg: 'Send email verification Successfully',
            };
        }, {
            rethrow: true,
        });
    }

    /**
     ** @returns {Promise<void>}
     **/
    async sendOTP() {
        const {ctx, service} = this;

        /** Email in Request Body !*/
        this.validate({
            email: {type: 'string', trim: true},
            password: {type: 'string'},
        });

        return this.catch(async () => {
            const result = await service.user.emailVerification.sendOTP({
                ...ctx.request.body,
                uid: ctx.user.id,
            });
            return {
                data: result,
                msg: 'Send OTP Successfully',
            };
        }, {
            rethrow: true,
        });
    }

    async verify() {
        const {ctx, service} = this;

        this.validate({
            token: {type: 'string'},
        });


        return this.catch(async () => {
            const result = await service.user.emailVerification.verify({
                token: ctx.query.token
            });

            return {
                data: result,
                msg: 'Email verified successfully',
            };
        }, {
            rethrow: new ClientError("Đường dẫn hết hạn hoặc đã sử dụng", 404),
        });
    }

    async verifyOTP() {
        const {ctx, service} = this;

        this.validate({
            otp: {type: 'string'},
        });

        return this.catch(async () => {

            const isVerified = await service.user.emailVerification.verifyOTP({
                otp: ctx.query.otp,
                uid: ctx.user.id
            });

            if (!isVerified) {
                throw new ClientError("OTP không hợp lệ", 404);
            }

            return isVerified;
        }, {
            rethrow: new ClientError("OTP không hợp lệ", 404),
        });
    }

}

module.exports = EmailVerificationController;
