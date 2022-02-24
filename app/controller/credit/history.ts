'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {ROLE} from "@/constants";

export default class CreditHistoryController extends BaseController {

    async index() {
        const {ctx, service} = this;

        this.validate({
            uid: {type: 'string?', default: ''},
            pageNo: {type: 'int?', convertType: 'int', default: 0},
            pageSize: {type: 'int?', convertType: 'int', default: 10},
            startDate: {type: 'date?'},
            endDate: {type: 'date?'},
        });

        return this.catch(async () => {
            return service.credit.history.findAndCountAll({
                ...ctx.params.permit('startDate', 'endDate'),
                uid: ctx.user.role.name === ROLE.MEMBER ? ctx.user.id : ctx.params.uid,
            });
        }, {
            errorCode: 2,
        });
    }

}

module.exports = CreditHistoryController;
