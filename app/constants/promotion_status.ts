/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

export const PROMOTION_STATUS = {
    CREATED: "CREATED",
    RUNNING: "RUNNING",
    EXPIRED: 'EXPIRED',
    RECEIVED: 'RECEIVED',
    CANCELLED: 'CANCELLED',
    CANCELLED_BY_USER: "CANCELLED_BY_USER"
};

export enum PROMOTION_STATUS_ENUM {
    CREATED = "CREATED",
    RUNNING = "RUNNING",
    EXPIRED = "EXPIRED",
    RECEIVED = "RECEIVED",
    CANCELLED = "CANCELLED",
    CANCELLED_BY_USER = "CANCELLED_BY_USER"
}
