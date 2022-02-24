/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

export const ERROR_CODE = {
    // Success
    0: 'Thành công',

    // The database has no such data || Query failed
    2: 'Không tìm thấy dữ liệu trong hệ thống',

    // Data creation failed
    3: 'Thao tác tạo thất bại',

    // Data deletion failed
    4: 'Xoá thất bại',

    // Data update failed
    5: 'Cập nhật thất bại',

    401: 'Chứng thực thất bại, vui lòng đăng nhập lại',

    403: 'Không có quyền',

    400: 'Tham số không hợp lệ',

    500: 'Hệ thống có lỗi xảy ra, vui lòng thử lại sau',
};
