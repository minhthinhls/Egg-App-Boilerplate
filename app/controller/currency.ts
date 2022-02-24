'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {/*ROLE*/} from "@/constants";

export default class CurrencyController extends BaseController {

    async index() {
        const {service} = this;

        const result = await service.currency.findAndCountAll({}, {
            order: [['name', 'ASC']],
            raw: true,
        });

        return this.response({
            rows: await Promise.all([
                ...result.rows.map(async (currency) => {
                    return ({
                        /** Add extra attributes here !*/
                        ...currency,
                    });
                }),
            ]),
            count: result.count,
        });
    }

    async create() {
        const {ctx, service} = this;

        this.validate({
            name: {type: 'string'},
            sellPrice: {type: 'string', convertType: 'string'},
            buyPrice: {type: 'string', convertType: 'string'},
        });

        return this.catch(async () => {
            const result = await service.currency.create({
                ...ctx.params.permit('name', 'sellPrice', 'buyPrice'),
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
            sellPrice: {type: 'string', convertType: 'string'},
            buyPrice: {type: 'string', convertType: 'string'},
        });

        return this.catch(async () => {
            const result = await service.currency.update({
                ...ctx.params.permit('id', 'name', 'sellPrice', 'buyPrice'),
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

module.exports = CurrencyController;
