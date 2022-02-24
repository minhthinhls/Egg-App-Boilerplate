'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {/*ROLE*/} from "@/constants";

export default class Common extends BaseController {

    async index() {
        const {ctx} = this;
        ctx.body = 'Xin chào đến với Egg-Boilerplate !';
    }

    async captcha(): Promise<void> {
        const {ctx} = this;
        const code = ctx.query.code || '1234';
        const svg = require('svg-captcha')(code, {
            size: 4,
        });

        ctx.type = 'svg';
        ctx.body = svg;
    }

    /**
     ** - Get backend homepage panel data
     ** @to-keep
     ** @returns {Promise<void>}
     **/
    async getPanelData(): Promise<void> {
        /** Do something here */
        const {ctx, service} = this;

        if (ctx.user.role.name === 'MEMBER') {
            const [waitingRequestCount] = await Promise.all([
                service.request.getWaitingCount({uid: ctx.user.id}),
            ]);

            return this.response({
                waitingRequestCount
            });
        }

        const [waitingRequestCount] = await Promise.all([
            service.request.getWaitingCount(),
        ]);

        return this.response({
            waitingRequestCount
        });
    }
}

module.exports = Common;
