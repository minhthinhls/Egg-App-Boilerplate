/* eslint-disable-next-line no-unused-vars */
import type {EggLogger} from "egg";
/* eslint-disable-next-line no-unused-vars */
import type {IService as Service} from "egg";
/* eslint-disable-next-line no-unused-vars */
import Account from "@/service/account";
/* eslint-disable-next-line no-unused-vars */
import Banker from "@/service/banker";
/* eslint-disable-next-line no-unused-vars */
import BankerPrice from "@/service/banker_price";
/* eslint-disable-next-line no-unused-vars */
import BankerProduct from "@/service/banker_product";
/* eslint-disable-next-line no-unused-vars */
import Credit from "@/service/credit";
/* eslint-disable-next-line no-unused-vars */
import CreditHistory from "@/service/credit/history";
/* eslint-disable-next-line no-unused-vars */
import Crypto from "@/service/crypto";
/* eslint-disable-next-line no-unused-vars */
import Currency from "@/service/currency";
/* eslint-disable-next-line no-unused-vars */
import Excel from "@/service/excel";
/* eslint-disable-next-line no-unused-vars */
import Language from "@/service/language";
/* eslint-disable-next-line no-unused-vars */
import Mail from "@/service/mail";
/* eslint-disable-next-line no-unused-vars */
import Message from "@/service/message";
/* eslint-disable-next-line no-unused-vars */
import Price from "@/service/price";
/* eslint-disable-next-line no-unused-vars */
import Product from "@/service/product";
/* eslint-disable-next-line no-unused-vars */
import Request from "@/service/request";
/* eslint-disable-next-line no-unused-vars */
import RequestMessage from "@/service/request/message";
/* eslint-disable-next-line no-unused-vars */
import Role from "@/service/role";
/* eslint-disable-next-line no-unused-vars */
import TransferLog from "@/service/transfer/log";
/* eslint-disable-next-line no-unused-vars */
import User from "@/service/user";
/* eslint-disable-next-line no-unused-vars */
import UserBankAccount from "@/service/user/bank_account";
/* eslint-disable-next-line no-unused-vars */
import UserEmailVerification from "@/service/user/email_verification";
/* eslint-disable-next-line no-unused-vars */
import UserLevel from "@/service/user/level";
/* eslint-disable-next-line no-unused-vars */
import UserLevelLog from "@/service/user/level/log";
/* eslint-disable-next-line no-unused-vars */
import UserPasswordReset from "@/service/user/password/reset";
/* eslint-disable-next-line no-unused-vars */
import UserVirtualWallet from "@/service/user/virtual_wallet";

/** Import all Extended Static Sequelize Models !*/
export declare interface IService extends Service {
    logger: EggLogger;
    account: Account;
    banker: Banker;
    bankerPrice: BankerPrice;
    bankerProduct: BankerProduct;
    credit: Credit & {
        history: CreditHistory;
    };
    crypto: Crypto;
    currency: Currency;
    excel: Excel;
    language: Language;
    mail: Mail;
    message: Message;
    price: Price;
    product: Product;
    request: Request & {
        message: RequestMessage;
    };
    role: Role;
    transfer: {
        log: TransferLog;
    };
    user: User & {
        bankAccount: UserBankAccount;
        emailVerification: UserEmailVerification;
        level: UserLevel & {
            log: UserLevelLog;
        };
        password: {
            reset: UserPasswordReset;
        };
        virtualWallet: UserVirtualWallet;
    };
}
