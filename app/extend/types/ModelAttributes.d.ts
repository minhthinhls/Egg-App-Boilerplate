/* eslint-disable-next-line no-unused-vars */
import * as Account from "@/model/account";
/* eslint-disable-next-line no-unused-vars */
import * as AccountHistory from "@/model/account/history";
/* eslint-disable-next-line no-unused-vars */
import * as Banker from "@/model/banker";
/* eslint-disable-next-line no-unused-vars */
import * as BankerPrice from "@/model/banker_price";
/* eslint-disable-next-line no-unused-vars */
import * as BankerProduct from "@/model/banker_product";
/* eslint-disable-next-line no-unused-vars */
import * as CommissionRefundConfig from "@/model/commission/refund/config";
/* eslint-disable-next-line no-unused-vars */
import * as CommissionRefundConfigHistory from "@/model/commission/refund/config/history";
/* eslint-disable-next-line no-unused-vars */
import * as Credit from "@/model/credit";
/* eslint-disable-next-line no-unused-vars */
import * as CreditHistory from "@/model/credit/history";
/* eslint-disable-next-line no-unused-vars */
import * as CreditPending from "@/model/credit/pending";
/* eslint-disable-next-line no-unused-vars */
import * as CryptoNetwork from "@/model/crypto/network";
/* eslint-disable-next-line no-unused-vars */
import * as Currency from "@/model/currency";
/* eslint-disable-next-line no-unused-vars */
import * as Message from "@/model/message";
/* eslint-disable-next-line no-unused-vars */
import * as Price from "@/model/price";
/* eslint-disable-next-line no-unused-vars */
import * as Product from "@/model/product";
/* eslint-disable-next-line no-unused-vars */
import * as Request from "@/model/request";
/* eslint-disable-next-line no-unused-vars */
import * as RequestHistory from "@/model/request/history";
/* eslint-disable-next-line no-unused-vars */
import * as RequestMessage from "@/model/request/message";
/* eslint-disable-next-line no-unused-vars */
import * as Role from "@/model/role";
/* eslint-disable-next-line no-unused-vars */
import * as TransferLog from "@/model/transfer/log";
/* eslint-disable-next-line no-unused-vars */
import * as User from "@/model/user";
/* eslint-disable-next-line no-unused-vars */
import * as UserBankAccount from "@/model/user/bank_account";
/* eslint-disable-next-line no-unused-vars */
import * as UserEmailVerificationToken from "@/model/user/email_verification/token";
/* eslint-disable-next-line no-unused-vars */
import * as UserHistory from "@/model/user/history";
/* eslint-disable-next-line no-unused-vars */
import * as UserLevel from "@/model/user/level";
/* eslint-disable-next-line no-unused-vars */
import * as UserLevelLog from "@/model/user/level/log";
/* eslint-disable-next-line no-unused-vars */
import * as UserLoginHistory from "@/model/user/login/history";
/* eslint-disable-next-line no-unused-vars */
import * as UserPasswordReset from "@/model/user/password/reset";
/* eslint-disable-next-line no-unused-vars */
import * as UserVirtualWallet from "@/model/user/virtual_wallet";
/* eslint-disable-next-line no-unused-vars */
import * as VnpayBank from "@/model/vnpay/bank";

/** Import all Extended Static Sequelize Models !*/
export declare interface IModelAttributes {
    Account: Account & {
        History: AccountHistory;
    };
    Banker: Banker;
    BankerPrice: BankerPrice;
    BankerProduct: BankerProduct;
    Commission: {
        Refund: {
            Config: CommissionRefundConfig & {
                History: CommissionRefundConfigHistory;
            };
        };
    };
    Credit: Credit & {
        History: CreditHistory;
        Pending: CreditPending;
    };
    Crypto: {
        Network: CryptoNetwork;
    };
    Currency: Currency;
    Message: Message;
    Price: Price;
    Product: Product;
    Request: Request & {
        History: RequestHistory;
        Message: RequestMessage;
    };
    Role: Role;
    Transfer: {
        Log: TransferLog;
    };
    User: User & {
        BankAccount: UserBankAccount;
        EmailVerification: {
            Token: UserEmailVerificationToken;
        };
        History: UserHistory;
        Level: UserLevel & {
            Log: UserLevelLog;
        };
        Login: {
            History: UserLoginHistory;
        };
        Password: {
            Reset: UserPasswordReset;
        };
        VirtualWallet: UserVirtualWallet;
    };
    Vnpay: {
        Bank: VnpayBank;
    };
}
