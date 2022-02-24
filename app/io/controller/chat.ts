/** Import Egg-Modules as Typed Namespace !*/
import "egg";
/** Import Application Placeholder from Egg:Modules !*/
import "egg-socket.io/app";

/** Import Pre-Defined Types Helper !*/
import type {IContext} from "@/extend/types";

declare module "egg" {
    /* eslint-disable-next-line @typescript-eslint/naming-convention */
    export interface CustomController {
        chat: {
            chat: typeof chat;
            disconnect: typeof disconnect;
        };
    }
}

export const chat = async function (this: IContext): Promise<void> {
    const {socket} = this;
    const message = this.args[0];
    const user: {username: string} = socket['user'];
    await this.socket.emit('res', `Hi %${user.username}! I've got your message: ${message}`);
};

export const disconnect = async function (this: IContext): Promise<void> {
    console.log('client disconnected');
};

/** For ES5 Import Statement !*/
module.exports = {
    chat: chat,
    disconnect: disconnect,
};
