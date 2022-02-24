'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {/*ROLE*/} from "@/constants";

export default class LanguageController extends BaseController {

    /**
     ** @to-keep
     **/
    async getLanguage() {
        const {ctx, service} = this;
        const {lng, ns} = ctx.params;

        /** TODO: Should be deprecated in the near future. !*/
        try {
            const result = await service.language.get(lng, ns);

            // Send JSON as response
            ctx.body = {...result};
        } catch (error) {
            return this.response({
                errorCode: 2,
                msg: "No language resource",
            });
        }
        /* Consider moving to this API.
        return this.catch(async () => {
            return service.language.get(lng, ns);
        }, {
            /!* [[Optional Attributes Placeholder]] *!/
            errorCode: 2,
            msg: "No language resource",
        });
        */
    }

}

module.exports = LanguageController;
