'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {/*ROLE*/} from "@/constants";

export default class PriceController extends BaseController {

    async index() {
        const {service} = this;

        return this.catch(async () => {
            return service.price.findAndCountAll({}, {
                order: [['exchangeRate', 'DESC']],
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
            exchangeRate: {type: 'number'},
        });

        return this.catch(async () => {
            const result = await service.price.create({
                ...ctx.params.permit('name', 'exchangeRate'),
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
            name: {type: 'string'},
            exchangeRate: {type: 'number'},
        });

        return this.catch(async () => {
            const result = await service.price.update({
                ...ctx.params.permit('id', 'name', 'exchangeRate'),
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

module.exports = PriceController;
