'use strict';

import {BaseController} from "@/extend/class";

export default class CryptoController extends BaseController {

    async cryptoNetworkList() {
        const {service} = this;

        return this.catch(async () => {
            return service.crypto.findAllCryptoNetworkList();
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 2,
        });
    }

}

module.exports = CryptoController;
