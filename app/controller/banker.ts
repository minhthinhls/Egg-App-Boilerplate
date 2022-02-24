'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {/*ROLE*/} from "@/constants";

export default class BankerController extends BaseController {

    async index() {
        const {service} = this;

        const result = await service.banker.findAndCountAll();
        return this.response(result);
    }

    async create() {
        const {ctx, service} = this;

        this.validate({
            name: {type: 'string'},
            shortName: {type: 'string'},
            website: {type: 'string', convertType: 'string'},
            min: {type: 'number'},
            max: {type: 'number'},
            posterUrl: {type: 'string'},
            bookType: {type: 'string'},
        });

        return this.catch(async () => {
            const result = await service.banker.create({
                ...ctx.params.permit([
                    'name', 'shortName',
                    'website', 'posterUrl',
                    'min', 'max', 'bookType',
                ]),
            });
            return {
                data: result,
                msg: 'Created Successfully'
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
            shortName: {type: 'string'},
            website: {type: 'string', convertType: 'string'},
            min: {type: 'number'},
            max: {type: 'number'},
            posterUrl: {type: 'string'},
            bookType: {type: 'string'},
        });

        return this.catch(async () => {
            const result = await service.banker.update({
                ...ctx.params.permit([
                    'id', 'name', 'shortName',
                    'website', 'posterUrl',
                    'min', 'max', 'bookType',
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

    /**
     ** Add price to this banker
     ** @returns {Promise<void>}
     **/
    async addBankerPrice() {
        const {ctx, service} = this;

        this.validate({
            bankerId: {type: 'string'},
            priceId: {type: 'string'},
        });

        return this.catch(async () => {
            const result = await service.bankerPrice.create({
                ...ctx.params.permit('bankerId', 'priceId'),
            });
            return {
                data: result,
                msg: 'Added Successfully',
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 3,
        });
    }

    /**
     ** Delete this banker price
     ** @returns {Promise<void>}
     **/
    async deleteBankerPrice() {
        const {ctx, service} = this;

        this.validate({
            bankerId: {type: 'string'},
            priceId: {type: 'string'},
        });

        return this.catch(async () => {
            await service.bankerPrice.destroy({
                ...ctx.params.permit('bankerId', 'priceId'),
            });
            return {
                msg: 'Deleted Successfully',
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 4,
        });
    }

    /**
     ** Update banker price record
     ** @returns {Promise<void>}
     **/
    async updateBankerPrice() {
        const {ctx, service} = this;

        this.validate({
            bankerPriceId: {type: 'string'},
            priceId: {type: 'string'},
        });

        return this.catch(async () => {
            await service.bankerPrice.update({
                id: ctx.params.bankerPriceId,
                priceId: ctx.params.priceId,
            });
            return {
                msg: 'Updated Successfully',
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 5,
        });
    }

    /**
     ** Add product to banker
     ** @returns {Promise<void>}
     **/
    async addBankerProduct() {
        const {ctx, service} = this;

        this.validate({
            bankerId: {type: 'string'},
            productId: {type: 'string'},
            constants: {type: 'array', itemType: 'string'},
        });

        return this.catch(async () => {
            const result = await service.bankerProduct.create({
                ...ctx.params,
            });
            return {
                data: result,
                msg: 'Added Successfully',
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 3,
        });
    }

    /**
     ** Delete this product banker
     ** @returns {Promise<void>}
     **/
    async deleteBankerProduct() {
        const {ctx, service} = this;

        this.validate({
            bankerId: {type: 'string'},
            productId: {type: 'string'},
        });

        return this.catch(async () => {
            const result = await service.bankerProduct.destroy({
                ...ctx.params,
            });
            return {
                data: result,
                msg: 'Deleted Successfully'
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 4,
        });
    }

    /**
     ** Update product constants
     ** @returns {Promise<void>}
     **/
    async updateBankerProduct() {
        const {ctx, service} = this;

        this.validate({
            bankerProductId: {type: 'string'},
            constants: {type: 'array', itemType: 'string'},
        });

        const {bankerProductId, constants} = ctx.params;

        return this.catch(async () => {
            const result = await service.bankerProduct.update({
                id: bankerProductId,
                constants: constants,
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

module.exports = BankerController;
