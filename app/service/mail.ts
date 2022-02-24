'use strict';

import {BaseService} from "@/extend/class";

/** Import ES6 Default Dependencies !*/
import validator from "validator";
/** Import ES6 Default Dependencies !*/
import Handlebars from "handlebars";

/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";

const __WELCOME_TEMPLATE__ = Handlebars.compile(`
    <html lang="VN">
        <head>
            <title></title>
            <style></style>
        </head>
        <body>
            <p>Chào {{name}},</p>
            <p>KDO88 hỗ trợ nạp và rút 24/7 -  không yêu cầu vòng cược.</p>
            <span>+Khuyến mãi tân thủ 200% lên đến hơn 10,000,000 VND</span><br/>
            <span>+Hoàn trả hoa hồng hàng ngày cao nhất thị trường lên đến 1.5%</span><br/>
            <span>+Các thương hiệu nổi tiếng</span><br/>
            
            <br/>
            <a>KDO88 cam kết:</a>
            <br/>
            <span>+Tỉ lệ cá cược cao nhất thị trường.</span><br/>
            <span>+Giao dịch nhanh chóng từ 3-5 phút.</span><br/>
            <span>+Đảm bảo tiền gửi, tiền thắng được thanh toán tuyệt đối.</span><br/>
        </body>
    </html>
`);

export default class MailService extends BaseService {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
    }

    /**
     ** - Registration notice
     ** @param {IUserAttributes} user
     ** @returns {Promise<void>}
     **/
    async register(user: IUserAttributes) {
        if (!validator.isEmail(user.email)) return;

        await this.send({
            from: `KDO88.NET: <${process.env.HOST_EMAIL}>`,
            to: [user.email],
            subject: "Chào mừng đến với KDO88",
            text: "Chào mừng đến với KDO88",
            html: __WELCOME_TEMPLATE__({
                name: user.username,
            }),
        });
    }

    /**
     ** - Send mail, always use this service to send
     ** @param {Object} data
     ** @returns {Promise}
     **/
    async send(data: {[p: string]: any}) {
        const {ctx, app} = this;
        let i = 3;
        // Try to send i times
        while (i--) {
            try {
                const result = await app.mailer.send(data);
                ctx.logger.info(`Mail: ${data.to} sent successfully`);
                return result;
            } catch (error) {
                ctx.logger.error(`Mail：${data.to} sending failed. Reason: account error or exceeding email sending frequency.`);
                if (i <= 0) {
                    return Promise.reject(error);
                }
            }
        }
    }
}

/** For ES5 Default Import Statement !*/
module.exports.default = MailService;
