import {BOOLEAN, TEXT, TINYINT, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/** Import Pre-Defined Types Helper !*/
import type {/*PlainObject*/} from "@/extend/types";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";

/** Import Deep Nested Models Attributes Defined Types !*/
import type {/*IModelDeepAttributes*/} from "@/extend/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IRequestAttributes} from "@/model/request";

export declare interface IExtraAttributes {
    /* [[Extra Attributes Placeholder]] */
    /** @example
     ** const html = Markdown.render(msg.content);
     **/
    html: string;
}

export declare interface IPopulateAttributes {
    /* [[Populated Attributes Placeholder]] */
    user: IUserAttributes;
    request: IRequestAttributes;
}

export declare interface IAttributes extends Partial<IPopulateAttributes>, Partial<IExtraAttributes> {
    id: string;
    uid: string;
    op_uid: string;
    title: string;
    content: string;
    requestId: string;
    type: number;
    showPopup: boolean;
    importanceLevel: number;
    hasRead: boolean;
    sentBy: string;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'uid' | 'op_uid' | 'title' | 'requestId' | 'type' | 'showPopup' | 'importanceLevel' | 'hasRead' | 'sentBy'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('message', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    uid: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
    },
    op_uid: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
    },
    requestId: {
        type: UUID,
        allowNull: true,
    },
    title: {
        type: TEXT({length: 'long'}),
        allowNull: false,
        comment: 'Message Title',
    },
    content: {
        type: TEXT({length: 'long'}),
        allowNull: false,
        comment: 'Message Content',
    },
    type: {
        type: TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Message type, 0 = system message',
    },
    showPopup: {
        type: BOOLEAN,
        allowNull: true,
        defaultValue: false,
        comment: 'Pop-Up message to user',
    },
    importanceLevel: {
        type: TINYINT,
        allowNull: true,
        defaultValue: 0,
        comment: 'Importance order, 0-Not at all important, 1-Very low importance, 2-Slightly important, 3-Important, 4-Fairly Important, 5-Very Important',
    },
    hasRead: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Have you read',
    },
    sentBy: {
        type: UUID,
        allowNull: true,
    },
}, (app) => {
    app.model.Message.belongsTo(app.model.User, {
        foreignKey: 'uid', targetKey: 'id', as: 'user', onDelete: 'CASCADE',
    });
    app.model.Message.belongsTo(app.model.Request, {
        foreignKey: 'request_id', targetKey: 'id', as: 'request', onDelete: 'CASCADE',
    });
    app.model.Message.belongsTo(app.model.User, {
        foreignKey: 'sent_by', targetKey: 'id', as: 'sentByUser', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['uid'], unique: false, name: 'user_id'},
        {fields: ['has_read'], unique: false, name: 'has_read'},
    ],
    hooks: {
        afterCreate: async function (/*request, options*/) {
            /** Fire back the message to Client Users here !*/
            return Promise.resolve();
        },
        afterUpdate: async function (/*request, options*/) {
            /** To-do Function !*/
            return Promise.resolve();
        },
    },
    underscored: true,
    charset: 'utf8mb4',
    engine: 'InnoDB',
}));
