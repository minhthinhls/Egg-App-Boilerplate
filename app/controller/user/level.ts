'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {/*ROLE*/} from "@/constants";

export default class UserLevelController extends BaseController {

    async index() {
        const {service} = this;

        return this.catch(async () => {
            return service.user.level.findAndCountAll({}, {
                order: [['cumulativeDeposit', 'ASC']],
            });
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 2,
        });
    }

    async create() {
        const {ctx, service} = this;

        this.validate({
            name: {type: 'string'},
            cumulativeDeposit: {type: 'number'},
            percentRefund: {type: 'number'},
        });

        return this.catch(async () => {
            const result = await service.user.level.create({
                ...ctx.params.permit([
                    'name', 'cumulativeDeposit', 'percentRefund',
                ]),
            });
            return {
                data: result,
                msg: 'Created Successfully',
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 3,
        });
    }

    async update() {
        const {ctx, service} = this;

        this.validate({
            id: {type: 'string'},
            name: {type: 'string', convertType: 'string'},
            cumulativeDeposit: {type: 'number'},
            percentRefund: {type: 'number'},
        });

        return this.catch(async () => {
            const result = await service.user.level.update({
                ...ctx.params.permit([
                    'id', 'name', 'cumulativeDeposit', 'percentRefund',
                ]),
            });
            return {
                data: result,
                msg: 'Updated Successfully',
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 5,
        });
    }

}

module.exports = UserLevelController;
