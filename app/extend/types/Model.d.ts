/* eslint-disable-next-line no-unused-vars */
import * as sequelize from "sequelize/types";
/* eslint-disable-next-line no-unused-vars */
import type {IModel as Model} from "egg";
/* eslint-disable-next-line no-unused-vars */
import Account from "@/model/account";
/* eslint-disable-next-line no-unused-vars */
import AccountHistory from "@/model/account/history";
/* eslint-disable-next-line no-unused-vars */
import Banker from "@/model/banker";
/* eslint-disable-next-line no-unused-vars */
import BankerPrice from "@/model/banker_price";
/* eslint-disable-next-line no-unused-vars */
import BankerProduct from "@/model/banker_product";
/* eslint-disable-next-line no-unused-vars */
import CommissionRefundConfig from "@/model/commission/refund/config";
/* eslint-disable-next-line no-unused-vars */
import CommissionRefundConfigHistory from "@/model/commission/refund/config/history";
/* eslint-disable-next-line no-unused-vars */
import Credit from "@/model/credit";
/* eslint-disable-next-line no-unused-vars */
import CreditHistory from "@/model/credit/history";
/* eslint-disable-next-line no-unused-vars */
import CreditPending from "@/model/credit/pending";
/* eslint-disable-next-line no-unused-vars */
import CryptoNetwork from "@/model/crypto/network";
/* eslint-disable-next-line no-unused-vars */
import Currency from "@/model/currency";
/* eslint-disable-next-line no-unused-vars */
import Message from "@/model/message";
/* eslint-disable-next-line no-unused-vars */
import Price from "@/model/price";
/* eslint-disable-next-line no-unused-vars */
import Product from "@/model/product";
/* eslint-disable-next-line no-unused-vars */
import Request from "@/model/request";
/* eslint-disable-next-line no-unused-vars */
import RequestHistory from "@/model/request/history";
/* eslint-disable-next-line no-unused-vars */
import RequestMessage from "@/model/request/message";
/* eslint-disable-next-line no-unused-vars */
import Role from "@/model/role";
/* eslint-disable-next-line no-unused-vars */
import TransferLog from "@/model/transfer/log";
/* eslint-disable-next-line no-unused-vars */
import User from "@/model/user";
/* eslint-disable-next-line no-unused-vars */
import UserBankAccount from "@/model/user/bank_account";
/* eslint-disable-next-line no-unused-vars */
import UserEmailVerificationToken from "@/model/user/email_verification/token";
/* eslint-disable-next-line no-unused-vars */
import UserHistory from "@/model/user/history";
/* eslint-disable-next-line no-unused-vars */
import UserLevel from "@/model/user/level";
/* eslint-disable-next-line no-unused-vars */
import UserLevelLog from "@/model/user/level/log";
/* eslint-disable-next-line no-unused-vars */
import UserLoginHistory from "@/model/user/login/history";
/* eslint-disable-next-line no-unused-vars */
import UserPasswordReset from "@/model/user/password/reset";
/* eslint-disable-next-line no-unused-vars */
import UserVirtualWallet from "@/model/user/virtual_wallet";
/* eslint-disable-next-line no-unused-vars */
import VnpayBank from "@/model/vnpay/bank";

/** Import all Extended Static Sequelize Models !*/
export declare interface IModel extends Model {
    Sequelize: typeof sequelize.Sequelize;
    Account: ReturnType<typeof Account> & {
        History: ReturnType<typeof AccountHistory>;
    };
    Banker: ReturnType<typeof Banker>;
    BankerPrice: ReturnType<typeof BankerPrice>;
    BankerProduct: ReturnType<typeof BankerProduct>;
    Commission: {
        Refund: {
            Config: ReturnType<typeof CommissionRefundConfig> & {
                History: ReturnType<typeof CommissionRefundConfigHistory>;
            };
        };
    };
    Credit: ReturnType<typeof Credit> & {
        History: ReturnType<typeof CreditHistory>;
        Pending: ReturnType<typeof CreditPending>;
    };
    Crypto: {
        Network: ReturnType<typeof CryptoNetwork>;
    };
    Currency: ReturnType<typeof Currency>;
    Message: ReturnType<typeof Message>;
    Price: ReturnType<typeof Price>;
    Product: ReturnType<typeof Product>;
    Request: ReturnType<typeof Request> & {
        History: ReturnType<typeof RequestHistory>;
        Message: ReturnType<typeof RequestMessage>;
    };
    Role: ReturnType<typeof Role>;
    Transfer: {
        Log: ReturnType<typeof TransferLog>;
    };
    User: ReturnType<typeof User> & {
        BankAccount: ReturnType<typeof UserBankAccount>;
        EmailVerification: {
            Token: ReturnType<typeof UserEmailVerificationToken>;
        };
        History: ReturnType<typeof UserHistory>;
        Level: ReturnType<typeof UserLevel> & {
            Log: ReturnType<typeof UserLevelLog>;
        };
        Login: {
            History: ReturnType<typeof UserLoginHistory>;
        };
        Password: {
            Reset: ReturnType<typeof UserPasswordReset>;
        };
        VirtualWallet: ReturnType<typeof UserVirtualWallet>;
    };
    Vnpay: {
        Bank: ReturnType<typeof VnpayBank>;
    };
}
