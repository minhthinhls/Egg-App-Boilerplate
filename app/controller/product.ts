'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {/*ROLE*/} from "@/constants";

export default class ProductController extends BaseController {

    async index() {
        const {service} = this;

        return this.catch(async () => {
            return service.product.findAndCountAll({}, {
                order: [['name', 'ASC']],
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
        });

        return this.catch(async () => {
            const result = await service.product.create({
                ...ctx.params.permit('name'),
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
        });

        return this.catch(async () => {
            const result = await service.product.update({
                ...ctx.params.permit('id', 'name'),
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

module.exports = ProductController;
