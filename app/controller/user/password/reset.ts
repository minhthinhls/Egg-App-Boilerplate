'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {/*ROLE*/} from "@/constants";

export default class ResetPasswordController extends BaseController {

    async create() {
        const {ctx, service} = this;

        this.validate({
            username: {type: 'string'},
        });

        return this.catch(async () => {
            const result = await service.user.password.reset.create({
                ...ctx.params.permit('username'),
            });
            return {
                data: result,
                msg: 'Created Successfully',
            };
        }, {
            errorCode: 3,
        });
    }

    /**
     ** @returns {Promise<void>}
     **/
    async email() {
        const {ctx, service} = this;

        /** Email & Username in Merged Params !*/
        this.validate({
            email: {type: 'string?'},
            phone: {type: 'string?'},
            username: {type: 'string?'},
        });

        return this.catch(async () => {
            const result = await service.user.password.reset.email({
                ...ctx.params.permit('email', 'phone', 'username'),
            });
            return {
                data: result,
                msg: 'Reset Password Successfully',
            };
        }, {
            rethrow: true,
        });
    }

    async exec() {
        const {ctx, service} = this;

        return this.catch(async () => {

            this.validate({
                password: {type: 'string'},
                p_confirm: {type: 'string'},
                token: {type: 'string'},
            });

            const result = await service.user.password.reset.exec({
                ...ctx.params.permit('password', 'p_confirm', 'token'),
            });

            return {
                data: result,
                msg: 'Reset Password Successfully',
            };
        }, {
            rethrow: true,
        });
    }

}

module.exports = ResetPasswordController;
