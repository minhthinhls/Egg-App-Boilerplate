'use strict';

import {BaseService} from "@/extend/class";

export default class LanguageService extends BaseService {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
    }

    /**
     ** - Get language
     ** @param {string} lng
     ** @param {string} ns
     ** @returns {Promise<{login: string, english: string, vietnamese: string}>}
     **/
    async get(lng: 'en' | 'vi', ns: 'translation'): Promise<{
        login: string;
        english: string;
        vietnamese: string;
    }> {
        const mock = {
            en: {
                translation: {
                    login: 'Login',
                    english: 'English',
                    vietnamese: 'Vietnamese',
                },
            },
            vi: {
                translation: {
                    login: 'Đăng nhập',
                    english: 'Tiếng Anh',
                    vietnamese: 'Tiếng Việt',
                },
            },
        };

        return mock[lng][ns];
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = LanguageService;
