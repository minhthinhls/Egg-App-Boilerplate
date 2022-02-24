/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

export const REQUEST_TYPE = {
    CREATE_ACCOUNT: "CREATE_ACCOUNT",
    CLOSE_ACCOUNT: "CLOSE_ACCOUNT",
    REOPEN_ACCOUNT: "REOPEN_ACCOUNT",
    RESET_PASSWORD: "RESET_PASSWORD",

    /* Transfer in: Bơm điểm vào account */
    TRANSFER_IN: "TRANSFER_IN",
    /* Transfer out: Rút điểm từ account */
    TRANSFER_OUT: "TRANSFER_OUT",

    /* Top-up: Nạp tiền vào ví */
    DEPOSIT: "DEPOSIT",
    /* Withdraw: Rút điểm từ ví */
    WITHDRAW: "WITHDRAW",
    UPDATE_PROFILE: "UPDATE_PROFILE",
};

export enum REQUEST_TYPE_ENUM {
    CREATE_ACCOUNT = "CREATE_ACCOUNT",
    CLOSE_ACCOUNT = "CLOSE_ACCOUNT",
    REOPEN_ACCOUNT = "REOPEN_ACCOUNT",
    RESET_PASSWORD = "RESET_PASSWORD",
    /* Transfer in: Bơm điểm vào account */
    TRANSFER_IN = "TRANSFER_IN",
    /* Transfer out: Rút điểm từ account */
    TRANSFER_OUT = "TRANSFER_OUT",
    /* Top-up: Nạp tiền vào ví */
    DEPOSIT = "DEPOSIT",
    /* Withdraw: Rút điểm từ ví */
    WITHDRAW = "WITHDRAW",
    UPDATE_PROFILE = "UPDATE_PROFILE",
}
