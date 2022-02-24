/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

export const MESSAGE_TYPE = {
    system: {
        welcome: {
            type: 0,
            title: 'Đăng kí thành công',
            content: "Chào mừng đến với KDO88 !"
        },
        suspend: {
            type: 1,
            title: 'Tài khoản của bạn đã bị ngừng'
        },
        reopen: {
            type: 2,
            title: 'Tài khoản của bạn đã được mở lại'
        }
    },
};
