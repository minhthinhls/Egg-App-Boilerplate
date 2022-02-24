/* eslint-disable-next-line no-unused-vars */
import * as mongoose from "mongoose";
/* eslint-disable-next-line no-unused-vars */
import User from "@/mongoose/user";

/** Import all Extended Static Sequelize Models !*/
export declare interface IMongoose extends mongoose.Mongoose {
    User: ReturnType<typeof User>;
}
