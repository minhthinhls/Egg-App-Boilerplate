'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {ROLE} from "@/constants";

export default class LogController extends BaseController {

    async index() {
        const {ctx, service} = this;

        this.validate({
            uid: {type: 'string?', default: ''},
            accountId: {type: 'string?', default: ''},
            accountUsername: {type: 'string?', default: ''},
        });

        const {uid, pageNo, pageSize} = ctx.params;

        return this.catch(async () => {
            return service.transfer.log.findAndCountAll({
                ...ctx.helper.extractPagingProps({pageSize, pageNo}),
                ...ctx.params.permit([
                    'startDate', 'endDate',
                    'accountId', 'accountUsername',
                ]),
                uid: ctx.user.role.name === ROLE.MEMBER ? ctx.user.id : uid,
            });
        }, {
            errorCode: 2,
        });
    }

}

module.exports = LogController;
