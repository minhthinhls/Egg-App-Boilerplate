'use strict';

import {BaseController} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {/*ROLE*/} from "@/constants";

/** Import Node Native Dependencies !*/
import * as path from "path";
/** Import Node Native Dependencies !*/
import * as fs from "fs";

const pump = require('../../node_modules/mz-modules/pump');

export default class UploadController extends BaseController {

    async action() {
        const {ctx, config} = this;

        const file = ctx.request.files[0];
        if (!file) {
            return this.response({
                errorCode: 400,
            });
        }

        const filename = `${Date.now()}_${file.filename}`;
        const targetPath = path.join(config.baseDir, 'app/public', filename);
        const source = fs.createReadStream(file.filepath);
        const target = fs.createWriteStream(targetPath);

        return this.catch(async () => {
            await pump(source, target);
            return {
                imageUrl: '/public/' + filename,
            };
        }, {
            /* [[Optional Attributes Placeholder]] */
            errorCode: 500,
        }).finally(() => {
            return ctx.cleanupRequestFiles();
        });
    }

}

module.exports = UploadController;
