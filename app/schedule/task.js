const {Subscription} = require('egg');

class Task extends Subscription {
    static get schedule() {
        return {
            /** Everyday on [[00:01:00]] !*/
            cron: '0 1 0 * * *',
            /** On after every [[10 seconds]] !*/
            // interval: '10s',
            type: 'all',
        };
    }

    async subscribe() {
        const {ctx} = this;
        try {
            // Do something here
        } catch (error) {
            ctx.logger.error(error);
        }
    }
}

module.exports = Task;
