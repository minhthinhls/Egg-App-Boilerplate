'use strict';

import {BaseService} from "@/extend/class";

export default class CryptoService extends BaseService {

    async findAllCryptoNetworkList() {
        const {ctx} = this;
        return ctx.model.Crypto.Network.findAll({
            raw: true,
        });
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = CryptoService;
