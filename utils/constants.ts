import { getDurationLocaleStringOrString } from "./utils";

// id
/** detail id(name: 缺) */
export const DETAIL_LACK_DURATION = 'DETAIL_LACK_DURATION';
/** detail id(name: 请假(hour)) */
export const DETAIL_LACK_DURATION_HOURS_RESULT = 'DETAIL_LACK_DURATION_HOURS_RESULT';

/** total id(name: 时间段相加) */
export const TOTAL_DURATION = 'TOTAL_DURATION';
/** total id(name: 请假(hour)) */
export const TOTAL_LACK_DURATION_HOURS_RESULT = 'TOTAL_LACK_DURATION_HOURS_RESULT';


export const DURATION_HOUR_PER_DAY = 8;
export const DURATION_PER_DAY = Temporal.Duration.from({ hours: DURATION_HOUR_PER_DAY });
export const DURATION_PER_DAY_STRING = getDurationLocaleStringOrString(DURATION_PER_DAY);


// local storage key
export const MONTHS_LOCAL_STORAGE_KEY = 'MONTHS_LOCAL_STORAGE_KEY';