/* eslint-disable-next-line no-unused-vars */
import {BaseService} from "@/extend/class";
/** Sequelize TRANSACTION & LOCKER INTERFACES !*/
import type {Transaction, LOCK} from "sequelize/types/lib/transaction";

/** @ts-ignore - Abstract Base Service currently got @deprecated !*/
export declare abstract class AbstractBaseService extends BaseService {
    protected FindOptions: Partial<{
        transaction: Transaction;
        lock: LOCK;
    }> & {[p: string]: any};

    protected findOne(id: string, options?: AbstractBaseService["FindOptions"]);

    protected findAll();
}
