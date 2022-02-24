'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {/*ROLE*/} from "@/constants";

/** Import Node Native Dependencies !*/
import * as os from "os";

export default class SystemController extends BaseController {

    /**
     ** @to-keep
     **/
    async index() {
        const {ctx} = this;

        return this.catch(async () => {
            const mysqlVersion = await ctx.model.query('SELECT VERSION() as mysqlVersion', {
                raw: true,
                plain: true
            });
            return {
                ...mysqlVersion,
                currentSystemTime: Date.now(),
                freemem: os.freemem(),
                totalmem: os.totalmem(),
                platform: os.platform(),
                type: os.type(),
                hostname: os.hostname(),
                arch: os.arch(),
                nodeVersion: process.version,
                cpus: os.cpus(),
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 2,
        });
    }

}

module.exports = SystemController;
