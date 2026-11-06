import { DURATION_PER_DAY, DURATION_PER_DAY_STRING, TOTAL_DURATION, TOTAL_LACK_DURATION_HOURS_RESULT } from "./constants";
import { alertUtil, getDurationLocaleStringOrString, getPlainTimeString, logUtil, temporalPlainTimeFrom } from "./utils";



export const getInitialTotalTimeRange = ({ id }: { id: string }): TotalTimeRangeType => {
    return {
        id,
        formValues: { startPlainTimeString: '00:00', endPlainTimeString: '00:00' },
        resultText: 'resultText',
    };
}

type ValidateTotalTimeRangeBetweenParams = {
    dayString: string;
    currentIndex: number;
    totalTimeRanges: TotalTimeRangeType[];
}
const validateTotalTimeRange = ({ dayString, currentIndex, totalTimeRanges }: ValidateTotalTimeRangeBetweenParams) => {
    const errorMessages: string[] = [];
    const notExists: string[] = [];

    if (currentIndex < 0) {
        errorMessages.push(`currentIndex: ${currentIndex} < 0`);

        const errorMessage = `${errorMessages.join(', ')}(day: ${dayString})`;
        alertUtil(errorMessage);
        return { success: false, message: errorMessage };
    }

    const item = totalTimeRanges[currentIndex];
    const start = item?.formValues.startPlainTimeString;
    const end = item?.formValues.endPlainTimeString;

    if (!start) {
        notExists.push(`start(index: ${currentIndex})`);
    }
    if (!end) {
        notExists.push(`end(index: ${currentIndex})`);
    }

    if (currentIndex === 0) {
        if ((!start) || (!end)) {
            const errorMessage = `${notExists.join(', ')} ${notExists.length > 1 ? 'are' : 'is'} not exist(day: ${dayString})`;
            alertUtil(errorMessage);
            return { success: false, message: errorMessage };
        }
        const startComesBeforeEnd = Temporal.PlainTime.compare(start, end) === -1; // -1: time1 comes before time2
        if (!startComesBeforeEnd) {
            errorMessages.push(`index(${currentIndex}): start is not before end`);

            const errorMessage = `${errorMessages.join(', ')}(day: ${dayString})`;
            alertUtil(errorMessage);
            return { success: startComesBeforeEnd, message: errorMessage };
        }

        return { success: startComesBeforeEnd, message: undefined };

    }

    const indexPrev = currentIndex-1;
    const itemPrev = totalTimeRanges[indexPrev];
    const endPrev = itemPrev?.formValues.endPlainTimeString;

    if (!endPrev) notExists.push(`end time(index: ${indexPrev})`);

    if ((!start) || (!end) || (!endPrev)) {
        const errorMessage = `${notExists.join(', ')} ${notExists.length > 1 ? 'are' : 'is'} not exist(day: ${dayString})`;
        alertUtil(errorMessage);
        return { success: false, message: errorMessage };
    }
 
    
    // success: endPrev comes before start && endPrev and start are same;
    // failed: endPrev comes after start
    const endPrevCompareWithStart = Temporal.PlainTime.compare(endPrev, start);
    const endPrevStartSuccess = (endPrevCompareWithStart === -1) || (endPrevCompareWithStart === 0);
    
    // success: start comes before end;
    // failed: start and end are same && start comes after end
    const startComesBeforeEnd = Temporal.PlainTime.compare(start, end) === -1;

    if (!endPrevStartSuccess) {
        errorMessages.push(`end(index: ${indexPrev}) comes after start(index: ${currentIndex})`);
    }
    if (!startComesBeforeEnd) {
        errorMessages.push(`index(${currentIndex}): start is not before end`);
    }

    const success = endPrevStartSuccess && startComesBeforeEnd;
    
    if (success) {
        return { success, message: undefined };
    }

    const errorMessage = `${errorMessages.join(', ')}(day: ${dayString})`;
    alertUtil(errorMessage);
    return { success, message: errorMessage };
}

type GetTotalDurationsParams = {
    formValues: TotalTimeRangeType['formValues'];
}
const getTotalDuration = ({ formValues: originalFormValues }: GetTotalDurationsParams) => {
    const startPlainTime = temporalPlainTimeFrom(originalFormValues.startPlainTimeString);
    const startPlainTimeAddOneMinute = startPlainTime.add({ minutes: 1 });
    const endPlainTime = temporalPlainTimeFrom(originalFormValues.endPlainTimeString);
    const endSinceStartAddOneMinuteDuration = endPlainTime.since(startPlainTimeAddOneMinute); // start time(+1) ~ end time

    // string
    const startPlainTimeString = getPlainTimeString(startPlainTime); // for form value
    const startPlainTimeAddOneMinuteString = getPlainTimeString(startPlainTimeAddOneMinute); // for text
    const endPlainTimeString = getPlainTimeString(endPlainTime); // for form value and text
    const endSinceStartDurationLocaleStringOrString = getDurationLocaleStringOrString(endSinceStartAddOneMinuteDuration); // for text

    const resultText = `${endPlainTimeString}减${startPlainTimeAddOneMinuteString} = ${endSinceStartDurationLocaleStringOrString}`;

    const formValues: typeof originalFormValues = { ...originalFormValues, startPlainTimeString, endPlainTimeString };
    return { formValues, endSinceStartAddOneMinuteDuration, resultText };
}
type GetTotalDurationSummaryParams = {
    subtractPlainTimeString: string;
    dayString: string;
    totalTimeRangeDurations: Temporal.Duration[];
}
const getTotalDurationSummary = ({ subtractPlainTimeString, dayString, totalTimeRangeDurations }: GetTotalDurationSummaryParams): TotalDurationsSummaryItem[] => {
    // TODO: 是否可以将以下的验证与validateTotalTimeRange整合？
    if (!subtractPlainTimeString) {
        const errorMessage = `subtract time of total is not exist(day: ${dayString})`;
        alertUtil(errorMessage);
        return [{ id: "errorMessage", name: "Error Message", durationString: errorMessage }]
    }
    
    // sum durations(every time ranges)
    const totalTimeRangesDuration = totalTimeRangeDurations.reduce((pre, item) => pre.add(item), new Temporal.Duration());

    const totalDurationBeforeSubtractSummaryItem: TotalDurationsSummaryItem = {
        id: TOTAL_DURATION,
        name: "时间段相加",
        durationString: `${
            totalTimeRangeDurations.length > 0 ? totalTimeRangeDurations.map(getDurationLocaleStringOrString).join(' + ') : getDurationLocaleStringOrString(totalTimeRangesDuration)
        } = ${getDurationLocaleStringOrString(totalTimeRangesDuration)}`,
    };

    // subtract duration
    const subtractDuration = temporalPlainTimeFrom(subtractPlainTimeString).since(new Temporal.PlainTime());

    // success: sum durations(every time ranges) is not shorter than subtract(totalTimeRangesDuration is not shorter than subtractDuration)
    const totalTimeRangesDurationSubtractDurationSuccess = Temporal.Duration.compare(totalTimeRangesDuration, subtractDuration) !== -1;
    if (!totalTimeRangesDurationSubtractDurationSuccess) {
        const errorMessage = `sum duration(every time ranges) is shorter than subtract(day: ${dayString})`;
        alertUtil(errorMessage);

        const totalDurationsSummary: TotalDurationsSummaryItem[] = [
            totalDurationBeforeSubtractSummaryItem,
            { id: "result", name: "Result", durationString: errorMessage },
        ];

        return totalDurationsSummary;
    }
    
    // sum durations(every time ranges) - subtract duration
    const durationTotal = totalTimeRangesDuration.subtract(subtractDuration);

    const durationResultAfterSubtractSummaryItem: TotalDurationsSummaryItem = {
        id: "result",
        name: "Result",
        durationString: `${getDurationLocaleStringOrString(totalTimeRangesDuration)} - ${getDurationLocaleStringOrString(subtractDuration)} = ${getDurationLocaleStringOrString(durationTotal)}`,
    };

    // success: durationPerDay is not shorter than durationTotal
    const durationPerDayDurationTotalSuccess = Temporal.Duration.compare(DURATION_PER_DAY, durationTotal) !== -1;
    if (!durationPerDayDurationTotalSuccess) {
        const errorMessage = `duration per day is shorter than total duration(day: ${dayString})`;
        alertUtil(errorMessage);

        const totalDurationsSummary: TotalDurationsSummaryItem[] = [
            totalDurationBeforeSubtractSummaryItem,
            durationResultAfterSubtractSummaryItem,
            { id: TOTAL_LACK_DURATION_HOURS_RESULT, name: "请假", durationString: errorMessage }
        ];
        return totalDurationsSummary;
    }
        
    // duration per day - (sum durations - subtract duration)
    const lackDurationTotal = DURATION_PER_DAY.subtract(durationTotal);

    const lackDurationTotalCeilNumber = lackDurationTotal.round({ smallestUnit: 'hours', largestUnit: 'hours', roundingMode: 'ceil' }).total('hours');

    const totalDurationsSummary: TotalDurationsSummaryItem[] = [
        totalDurationBeforeSubtractSummaryItem,
        durationResultAfterSubtractSummaryItem,
        {
            id: TOTAL_LACK_DURATION_HOURS_RESULT,
            name: "请假",
            durationString: `${DURATION_PER_DAY_STRING} - ${getDurationLocaleStringOrString(durationTotal)} = ${getDurationLocaleStringOrString(lackDurationTotal)}(${lackDurationTotalCeilNumber})`,
            durationMinutes: durationTotal.total('minutes'), // for detail validate only
        }
    ];

    return totalDurationsSummary;
}

type GetCalculatedTotalOfDayParams = {
    beforeCalculateTotal: DayTotalType;
    dayString: string;
}
export const getCalculatedTotalOfDay = ({ beforeCalculateTotal, dayString }: GetCalculatedTotalOfDayParams): DayTotalType => {
    const totalTimeRangeDurations: Temporal.Duration[] = [];

    const { validateSuccess, timeRanges: totalTimeRanges } = beforeCalculateTotal.totalTimeRanges.reduce<{ validateSuccess: boolean; timeRanges: TotalTimeRangeType[] }>((pre, totalTimeRange, i, array) => {

        const { success, message } = validateTotalTimeRange({ dayString, currentIndex: i, totalTimeRanges: array });

        if (!success) {
            return { validateSuccess: false, timeRanges: [...pre.timeRanges, { ...totalTimeRange, resultText: message }] };
        }
        const {
            formValues,
            endSinceStartAddOneMinuteDuration,
            resultText,
        } = getTotalDuration({ formValues: totalTimeRange.formValues });

        totalTimeRangeDurations.push(endSinceStartAddOneMinuteDuration);

        return { validateSuccess: pre.validateSuccess === false ? false : true, timeRanges: [...pre.timeRanges, { ...totalTimeRange, formValues, resultText }] };
    }, { validateSuccess: true, timeRanges: [] });
    
    if (!validateSuccess) {
        totalTimeRangeDurations.length = 0;
        return { ...beforeCalculateTotal, totalTimeRanges, totalDurationsSummary: [] };
    }

    const totalDurationsSummary = getTotalDurationSummary({ subtractPlainTimeString: beforeCalculateTotal.subtractPlainTimeString, dayString, totalTimeRangeDurations });

    return {
        ...beforeCalculateTotal,
        totalTimeRanges,
        totalDurationsSummary,
    }
}


type ChangeTotalToMarkdownTextParams = {
    months: MonthType[];
}
export const changeTotalToMarkdownText = ({ months }: ChangeTotalToMarkdownTextParams) => {
    const detailMarkdownText = months.reduce((pre, month, monthIndex) => {
        const daysString = month.days.reduce((preDaysString, day) => {
            const totalTimeRanges = day.total.totalTimeRanges;

            const timeRangesString = totalTimeRanges.reduce((preTimeRangesString, timeRange)=> {
                const start = timeRange.formValues.startPlainTimeString;
                const end = timeRange.formValues.endPlainTimeString;
                const resultText = timeRange.resultText;
                return `${preTimeRangesString}\n\t- ${start}-${end} | result: ${resultText}`;
            }, '');
            const subtract = day.total.subtractPlainTimeString;

            const durationsSummary = day.total.totalDurationsSummary;

            const durationsSummaryString = durationsSummary.reduce((preDetailDurationsSummaryString, summaryItem)=> {
                const name = summaryItem.name;
                const durationString = summaryItem.durationString;

                return `${preDetailDurationsSummaryString}\n\t- ${name}: ${durationString}`;
            }, '');

            return `${preDaysString}\n\n- ${day.dayString}${timeRangesString}\n\t- 减去${subtract}\n${durationsSummaryString}`;
        }, '');
        return `${pre}${monthIndex === 0 ? '' : '\n\n'}### ${month.monthString}${daysString}`;
    }, '');

    return detailMarkdownText;
};

type ChangeTotalToMarkdownTextForCompareWithPhotosParams = {
    months: MonthType[];
}
export const changeTotalToMarkdownTextForCompareWithPhotos = ({ months }: ChangeTotalToMarkdownTextForCompareWithPhotosParams) => {
    const markdownText = months.reduce((pre, month, monthIndex) => {
        
        const daysString = month.days.reduce((preDaysString, day, dateIndex) => {
            const totalTimeRanges = day.total.totalTimeRanges;

            const timeRangesString = totalTimeRanges.reduce((preTimeRangesString, timeRange)=> {
                const start = timeRange.formValues.startPlainTimeString;
                const end = timeRange.formValues.endPlainTimeString;
                const resultText = timeRange.resultText;
                return `${preTimeRangesString}\n\t- ${start}-${end} | result: ${resultText}`;
            }, '');

            const totalDuration = day.total.totalDurationsSummary.find(i => i.id === TOTAL_DURATION);
            
            const totalDurationText = totalDuration ? `\n\n\t- ${totalDuration.name}: ${totalDuration.durationString}` : '';

            return `${preDaysString}${((monthIndex === 0) && (dateIndex === 0)) ? '' : '\n\n'}- ${day.dayString}${timeRangesString}${totalDurationText}`;
        }, '');

        return `${pre}${daysString}`;
    }, '');
    
    return markdownText;
};