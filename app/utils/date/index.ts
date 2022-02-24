import * as moment from 'moment-timezone';

const FORMAT_DATE = 'YYYY-MM-DD';

export const get4WeeksOfMonth = (month: 'YYYY-MM' | string): Array<[string, string]> => {
    const firstDay = moment(month, 'YYYY-MM').clone().startOf('month');

    if (!firstDay.isValid()) {
        throw new Error('Param [Month] must be in format YYYY-MM');
    }

    /** Find first Monday of Month */
    let _1st_Monday = firstDay.isoWeekday(8);
    if (_1st_Monday.date() > 7) {
        _1st_Monday = _1st_Monday.isoWeekday(-6);
    }

    const _2nd_Monday = _1st_Monday.clone().add(1, 'week');
    const _3rd_Monday = _1st_Monday.clone().add(2, 'week');
    const _4th_Monday = _1st_Monday.clone().add(3, 'week');

    return [
        [_1st_Monday, _1st_Monday.clone().add(6, 'days')],
        [_2nd_Monday, _2nd_Monday.clone().add(6, 'days')],
        [_3rd_Monday, _3rd_Monday.clone().add(6, 'days')],
        [_4th_Monday, _4th_Monday.clone().add(6, 'days')],
    ].map(([from, to]) => [from.format(FORMAT_DATE), to.format(FORMAT_DATE)]);
};
