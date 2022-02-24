'use strict';

import {BaseController} from "@/extend/class";

/** Import ES6 Default Dependencies !*/
import {isEmpty} from "lodash";

export default class RequestMessageController extends BaseController {

    /**
     ** - Default Function to be called when Main Router did not specify any Owned Function from this [Request_Message] Controller Class !
     ** @see {@link https://github.com/node-modules/parameter} - Validate Rules
     ** @returns {Promise<void>}
     **/
    async index() {
        const {ctx, service} = this;

        this.validate({
            requestId: {type: 'string?', default: null}
        });

        const {requestId} = ctx.params;

        return this.catch(async () => {
            return isEmpty(requestId)
                ? await service.request.message.findAll()
                : await service.request.message.findAllByRequestId(requestId);
        }, {
            errorCode: 2,
        });
    }

}

module.exports = RequestMessageController;
