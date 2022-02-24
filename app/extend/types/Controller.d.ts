/* eslint-disable-next-line no-unused-vars */
import type {EggLogger} from "egg";
/* eslint-disable-next-line no-unused-vars */
import type {IController as Controller} from "egg";
/* eslint-disable-next-line no-unused-vars */
import Account from "@/controller/account";
/* eslint-disable-next-line no-unused-vars */
import Banker from "@/controller/banker";
/* eslint-disable-next-line no-unused-vars */
import Common from "@/controller/common";
/* eslint-disable-next-line no-unused-vars */
import CreditHistory from "@/controller/credit/history";
/* eslint-disable-next-line no-unused-vars */
import Crypto from "@/controller/crypto";
/* eslint-disable-next-line no-unused-vars */
import Currency from "@/controller/currency";
/* eslint-disable-next-line no-unused-vars */
import Language from "@/controller/language";
/* eslint-disable-next-line no-unused-vars */
import Message from "@/controller/message";
/* eslint-disable-next-line no-unused-vars */
import Price from "@/controller/price";
/* eslint-disable-next-line no-unused-vars */
import Product from "@/controller/product";
/* eslint-disable-next-line no-unused-vars */
import Request from "@/controller/request";
/* eslint-disable-next-line no-unused-vars */
import RequestMessage from "@/controller/request/message";
/* eslint-disable-next-line no-unused-vars */
import System from "@/controller/system";
/* eslint-disable-next-line no-unused-vars */
import TransferLog from "@/controller/transfer/log";
/* eslint-disable-next-line no-unused-vars */
import Upload from "@/controller/upload";
/* eslint-disable-next-line no-unused-vars */
import User from "@/controller/user";
/* eslint-disable-next-line no-unused-vars */
import UserBankAccount from "@/controller/user/bank_account";
/* eslint-disable-next-line no-unused-vars */
import UserEmailVerification from "@/controller/user/email_verification";
/* eslint-disable-next-line no-unused-vars */
import UserLevel from "@/controller/user/level";
/* eslint-disable-next-line no-unused-vars */
import UserPasswordReset from "@/controller/user/password/reset";
/* eslint-disable-next-line no-unused-vars */
import UserVirtualWallet from "@/controller/user/virtual_wallet";

/** Import all Extended Static Sequelize Models !*/
export declare interface IController extends Controller {
    logger: EggLogger;
    account: Account;
    banker: Banker;
    common: Common;
    credit: {
        history: CreditHistory;
    };
    crypto: Crypto;
    currency: Currency;
    language: Language;
    message: Message;
    price: Price;
    product: Product;
    request: Request & {
        message: RequestMessage;
    };
    system: System;
    transfer: {
        log: TransferLog;
    };
    upload: Upload;
    user: User & {
        bankAccount: UserBankAccount;
        emailVerification: UserEmailVerification;
        level: UserLevel;
        password: {
            reset: UserPasswordReset;
        };
        virtualWallet: UserVirtualWallet;
    };
}
