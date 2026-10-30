export const alertUtil = (...params: any[]) => {
    console.error(...params);
    window.alert(...params);
};

export const logUtil = (...params: any[]) => {
    console.log(...params);
};

export const toPopForArray = <T extends unknown>(array: Array<T>): Array<T> => {
    return array.slice(0, array.length - 1);
};

export const temporalPlainYearMonthFrom = (item: Temporal.PlainYearMonthLike, options: Temporal.OverflowOptions = {}) => {
    return Temporal.PlainYearMonth.from(item, { overflow: 'reject', ...options });
};

export const getAddedPlainDateString = (item?: Temporal.PlainDateLike, options?: { addedDays: number }) => {
    if (!item) {
        return item;
    }
    const plainDate = Temporal.PlainDate.from(item, { overflow: 'reject' });
    /**
     * constrain: The date component is clamped to the valid range.
     * If the day doesn't exist but the month does: pick the closest day in the same month. If there are two equally-close dates in that month, pick the later one.
     */
    const addedPlainDate = plainDate.with({ day: plainDate.day + (options?.addedDays ?? 1) }, { overflow: 'constrain' });
    return addedPlainDate.toString();
};

export const temporalPlainTimeFrom = (item: Temporal.PlainTimeLike, options: Temporal.OverflowOptions = {}) => {
    return Temporal.PlainTime.from(item, { overflow: 'reject', ...options });
};

const spentWorkHourNumberFormatForInput = new Intl.NumberFormat('zh-CN', { useGrouping: false, roundingMode: 'floor', maximumFractionDigits: 1 });
export const formatSpentWorkHourForInput = (...params: Parameters<Intl.NumberFormat['format']>) => {
    return spentWorkHourNumberFormatForInput.format(...params);
};

type CalculateWorkHourParams = {
    durationHourPerDay: number;
    subtractHours: number[];
}
export const calculateFinalWorkHour = ({ durationHourPerDay, subtractHours }: CalculateWorkHourParams) => {
    return ((durationHourPerDay * 10) - (subtractHours.map(i => i * 10).reduce((pre, item) => (pre + item), 0))) / 10;
};

export const getDurationLocaleStringOrString = (duration: Temporal.Duration | undefined) => {
    return duration?.toLocaleString() || duration?.toString();
}

export function getPlainTimeString (plainTime: undefined, options?: Temporal.PlainTimeToStringOptions): undefined;
export function getPlainTimeString (plainTime: Temporal.PlainTime, options?: Temporal.PlainTimeToStringOptions): string;
export function getPlainTimeString (plainTime: Temporal.PlainTime | undefined, options: Temporal.PlainTimeToStringOptions = {}) {
    return plainTime?.toString({ smallestUnit: 'minutes', ...options });
}

type GetInitialMonthParams = {
    previousArrayLength: number;
    monthString: string;
}
export const getInitialMonth = ({ previousArrayLength, monthString }: GetInitialMonthParams) => {
    return { id: `${previousArrayLength + 1}`, monthString, days: [] };
}

type GetInitialDayParams = {
    previousArrayLength: number;
    dayString: string;
}
export const getInitialDay = ({ previousArrayLength, dayString }: GetInitialDayParams): DayType => {
    return { id: `${previousArrayLength + 1}`, dayString, dayNote: '', detail: { detailTimeRanges: [], detailDurationsSummary: [] }, total: { totalTimeRanges: [], subtractPlainTimeString: '00:00', totalDurationsSummary: [] } };
}

type IsInRangeParams = {
    value: number | string;
    min: number | string;
    max: number | string;
}
export const isInRange = ({ value, max, min }: IsInRangeParams) => {
    const minNumber = Number(min);
    const maxNumber = Number(max);
    const valueNumber = Number(value);
    const isValueGreaterThanOrEqualMin = valueNumber >= minNumber;
    const isValueLessThanOrEqualMax = valueNumber <= maxNumber;

    return isValueGreaterThanOrEqualMin && isValueLessThanOrEqualMax;
}

type GetPlainTimeStringOperatedParams = {
    originalPlainTimeString: Temporal.PlainTimeLike;
    operation: {
        type: 'add' | 'subtract';
        duration: Temporal.DurationLike;
    };
}
export const getPlainTimeStringOperated = ({ originalPlainTimeString, operation }: GetPlainTimeStringOperatedParams) => {
    const originalPlainTime = temporalPlainTimeFrom(originalPlainTimeString);
    return getPlainTimeString(originalPlainTime[operation.type](operation.duration));
}