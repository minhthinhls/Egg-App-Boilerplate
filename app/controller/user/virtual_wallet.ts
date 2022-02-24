'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {ROLE} from "@/constants";

export default class VirtualWalletController extends BaseController {

    async index() {
        const {ctx, service} = this;

        const uid = ctx.user.role?.name === ROLE.MEMBER ? ctx.user.id : ctx.query?.uid;

        const result = await service.user.virtualWallet.findAllByUid(uid);
        return this.response(result);
    }

    async create() {
        const {ctx, service} = this;

        this.validate({
            cryptoNetworkId: {type: 'string'},
            currencyId: {type: 'string'},
            payId: {type: 'string'},
            fullName: {type: 'string'},
        });

        return this.catch(async () => {
            const result = await service.user.virtualWallet.create({
                ...ctx.params,
            });
            return this.response({
                data: result,
                msg: 'Created Successfully',
            });
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 3,
            rethrow: new ClientError("Ví không hợp lệ", 400),
        });
    }

    async update() {
        const {ctx, service} = this;

        this.validate({
            id: {type: 'string'},
            cryptoNetworkId: {type: 'string'},
            currencyId: {type: 'string'},
            payId: {type: 'string'},
            fullName: {type: 'string'},
        });

        return this.catch(async () => {
            const result = await service.user.virtualWallet.update({
                ...ctx.params.permit([
                    'id', 'uid', 'payId', 'fullName',
                    'currencyId', 'cryptoNetworkId',
                ]),
            });
            return {
                data: result,
                msg: 'Updated Successfully',
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 5,
            rethrow: true,
        });
    }

    async deleteById() {
        const {ctx, service} = this;

        const {id} = ctx.params;

        return this.catch(async () => {
            await service.user.virtualWallet.deleteById(id);
            return this.response({
                msg: 'Deleted Successfully',
            });
        }, {
            errorCode: 4,
            rethrow: new ClientError("Yêu cầu xóa ví không thực hiện được", 400),
        });
    }

}

module.exports = VirtualWalletController;
