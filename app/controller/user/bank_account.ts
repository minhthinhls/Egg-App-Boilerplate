'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {ROLE} from "@/constants";

export default class BankAccountController extends BaseController {

    async index() {
        const {ctx, service} = this;
        if (ctx.user.role?.name === ROLE.MEMBER && ctx.query?.uid) {
            return ctx.throw(300, new ClientError("Unauthorized - Chứng thực thất bại"));
        }
        const uid = ctx.user.role?.name === ROLE.MEMBER ? ctx.user.id : ctx.query?.uid;

        const result = await service.user.bankAccount.findAllByUid(uid);
        return this.response(result);
    }

    async create() {
        const {ctx, service} = this;

        this.validate({
            bankId: {type: 'string'},
            cardNo: {type: 'string'},
            cardName: {type: 'string'},
            province: {type: 'string?'},
            city: {type: 'string?'},
            branchName: {type: 'string?'},
        });

        return this.catch(async () => {
            const result = await service.user.bankAccount.create({
                ...ctx.params,
            });
            return this.response({
                data: result,
                msg: 'Created Successfully',
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
            uid: {type: 'string'},
            bankId: {type: 'string'},
            cardNo: {type: 'string'},
            cardName: {type: 'string'},
            province: {type: 'string?'},
            city: {type: 'string?'},
            branchName: {type: 'string?'},
        });

        return this.catch(async () => {
            const result = await service.user.bankAccount.update({
                ...ctx.params,
            });
            return {
                data: result,
                msg: 'Updated Successfully',
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 5,
            rethrow: true
        });
    }

    async deleteById() {
        const {ctx, service} = this;

        const {id} = ctx.params;

        return this.catch(async () => {
            await service.user.bankAccount.deleteById(id);
            return this.response({
                msg: 'Deleted Successfully',
            });
        }, {
            errorCode: 4,
            rethrow: true,
        });
    }

}

module.exports = BankAccountController;
