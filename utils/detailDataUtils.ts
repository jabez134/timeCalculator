import { DETAIL_LACK_DURATION, DETAIL_LACK_DURATION_HOURS_RESULT, DURATION_HOUR_PER_DAY, DURATION_PER_DAY, DURATION_PER_DAY_STRING, TOTAL_LACK_DURATION_HOURS_RESULT } from "./constants";
import { alertUtil, calculateFinalWorkHour, formatSpentWorkHourForInput, getDurationLocaleStringOrString, getPlainTimeString, temporalPlainTimeFrom } from "./utils";

type GetDetailLackDurationHourSummaryParams = {
    subtractDetailDurationsSummary: DetailDurationsSummaryItem[];

}
export const getDetailLackDurationHourSummary = ({ subtractDetailDurationsSummary }: GetDetailLackDurationHourSummaryParams): DetailDurationsSummaryItem => {

    type ValidateResult = { success: boolean, hours: number[]; errorItems: string[]; };
    const { success, hours: subtractHours, errorItems } = subtractDetailDurationsSummary.reduce<ValidateResult>((pre, i) => {
        if ([DETAIL_LACK_DURATION, DETAIL_LACK_DURATION_HOURS_RESULT].includes(i.id)) {
            return pre;
        }
        if (!i.finalHourChangeable) {
            return pre;
        }

        const v = i.finalHour.value;
        if (v === '') {
            return { ...pre, success: false, hours: pre.hours, errorItems: [...pre.errorItems, `empty(${i.name})`] };
        }

        const vAsNumber = Number(v);

        if (!Number.isFinite(vAsNumber)) {
            return { ...pre, success: false, hours: pre.hours, errorItems: [...pre.errorItems, `${v}(${i.name})`] };
        }

        return { ...pre, hours: [...pre.hours, vAsNumber] };

    }, { success: true, hours: [], errorItems: [] });

    if (!success) {
        const errorMessage = `incorrect subtract hours: ${errorItems.join(', ')}`;
        alertUtil(errorMessage);
        return {
            id: DETAIL_LACK_DURATION_HOURS_RESULT,
            name: "请假(hour)",
            durationString: errorMessage,
            finalHourChangeable: false,
        };
    }

    const finalWorkHour = calculateFinalWorkHour({ durationHourPerDay: DURATION_HOUR_PER_DAY, subtractHours: subtractHours });

    return {
        id: DETAIL_LACK_DURATION_HOURS_RESULT,
        name: "请假(hour)",
        durationString: `${DURATION_HOUR_PER_DAY} - ${subtractHours.join(' - ')} = ${finalWorkHour}`,
        finalHourChangeable: true,
        finalHour: { value: '', min: `${finalWorkHour}`, max: `${DURATION_HOUR_PER_DAY}`, required: false },
    };
}

export const getInitialDetailTimeRange = ({ id }: { id: string }): DetailTimeRangeType => {
    return {
        id,
        formValues: { projectName: '', startPlainTimeString: '00:00', endPlainTimeString: '00:00', currentSubtractPlainTimeString: '00:00' },
        resultText: 'resultText',
    };
}

type ValidateDetailTimeRangeBetweenParams = {
    dayString: string;
    currentIndex: number;
    detailTimeRanges: DetailTimeRangeType[];
}
const validateDetailTimeRange = ({ dayString, currentIndex, detailTimeRanges }: ValidateDetailTimeRangeBetweenParams) => {

    if (currentIndex < 0) {
        const errorMessage = `currentIndex: ${currentIndex} < 0(day: ${dayString})`;
        alertUtil(errorMessage);
        return { success: false, message: errorMessage };
    }

    const item = detailTimeRanges[currentIndex];
    const projectName = item?.formValues.projectName;
    const start = item?.formValues.startPlainTimeString;
    const end = item?.formValues.endPlainTimeString;
    const subtract = item?.formValues.currentSubtractPlainTimeString;

    const notExists: string[] = [];
    if (!projectName) {
        notExists.push(`project name(index: ${currentIndex})`);
    }
    if (!start) {
        notExists.push(`start(index: ${currentIndex})`);
    }
    if (!end) {
        notExists.push(`end(index: ${currentIndex})`);
    }
    if (!subtract) {
        notExists.push(`subtract(index: ${currentIndex})`);
    }

    if (currentIndex === 0) {
        if ((!projectName) || (!start) || (!end) || (!subtract)) {
            const errorMessage = `${notExists.join(', ')} ${notExists.length > 1 ? 'are' : 'is'} not exist(day: ${dayString})`;
            alertUtil(errorMessage);
            return { success: false, message: errorMessage };
        }

        const startComesBeforeEnd = Temporal.PlainTime.compare(start, end) === -1; // -1: time1 comes before time2
        
        if (!startComesBeforeEnd) {
            const errorMessage = `index(${currentIndex}): start is not before end(day: ${dayString})`;
            alertUtil(errorMessage);
            return { success: startComesBeforeEnd, message: errorMessage };
        }

        return { success: startComesBeforeEnd, message: undefined };
    }

    const indexPrev = currentIndex-1;
    const itemPrev = detailTimeRanges[indexPrev];
    const endPrev = itemPrev?.formValues.endPlainTimeString;
    const subtractPrev = itemPrev?.formValues.currentSubtractPlainTimeString;

    if (!endPrev) notExists.push(`end time(index: ${indexPrev})`);
    if (!subtractPrev) notExists.push(`subtract time(index: ${indexPrev})`);

    if ((!projectName) || (!start) || (!end) || (!endPrev) || (!subtract) || (!subtractPrev)) {
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
    
    // success: subtractPrev comes before subtract && subtractPrev and subtract are same;
    // failed: subtractPrev comes after subtract
    const subtractPrevCompareWithSubtract = Temporal.PlainTime.compare(subtractPrev, subtract);
    const subtractPrevSubtractSuccess = (subtractPrevCompareWithSubtract === -1) || (subtractPrevCompareWithSubtract === 0);

    const errorMessages: string[] = [];
    if (!endPrevStartSuccess) {
        errorMessages.push(`end time(index: ${indexPrev}) comes after start time(index: ${currentIndex})`);
    }
    if (!startComesBeforeEnd) {
        errorMessages.push(`index(${currentIndex}): start is not before end`);
    }
    if (!subtractPrevSubtractSuccess) {
        errorMessages.push(`subtract(index: ${indexPrev}) comes after subtract(index: ${currentIndex})`);
    }

    const success = endPrevStartSuccess && startComesBeforeEnd && subtractPrevSubtractSuccess;
    
    if (success) {
        return { success, message: undefined };
    }

    const errorMessage = `${errorMessages.join(', ')}(day: ${dayString})`;
    alertUtil(errorMessage);
    return { success, message: errorMessage };
}

type GetDetailDurationParams = {
    formValues: DetailTimeRangeType['formValues'];
    previousSubtractTime: string;
}
const getDetailDuration = ({ formValues: originalFormValues, previousSubtractTime }: GetDetailDurationParams) => {
    const startPlainTime = temporalPlainTimeFrom(originalFormValues.startPlainTimeString);
    const startPlainTimeAddOneMinute = startPlainTime.add({ minutes: 1 });
    const endPlainTime = temporalPlainTimeFrom(originalFormValues.endPlainTimeString);
    const endSinceStartAddOneMinuteDuration = endPlainTime.since(startPlainTimeAddOneMinute); // start time(+1) ~ end time

    const previousSubtractPlainTimeSubtractOneMinute = temporalPlainTimeFrom(previousSubtractTime).subtract({ minutes: previousSubtractTime === '00:00' ? 0 : 1 });

    const currentSubtractPlainTime = temporalPlainTimeFrom(originalFormValues.currentSubtractPlainTimeString);

    const subtractDuration = currentSubtractPlainTime.since(previousSubtractPlainTimeSubtractOneMinute); // previous subtract time(-1) ~ current subtract time

    const resultTimeDuration = endSinceStartAddOneMinuteDuration.subtract(subtractDuration); // (start time(+1) ~ end time) - (previous subtract time(-1) ~ current subtract time)

    // string
    const startPlainTimeString = getPlainTimeString(startPlainTime); // for form value
    const endPlainTimeString = getPlainTimeString(endPlainTime); // for form value and text
    const currentSubtractPlainTimeString = getPlainTimeString(currentSubtractPlainTime); // for form value and text

    const resultText = `(${endPlainTimeString}减${getPlainTimeString(startPlainTimeAddOneMinute)}) - (${currentSubtractPlainTimeString}减${getPlainTimeString(previousSubtractPlainTimeSubtractOneMinute)})`
                    + ` = ${getDurationLocaleStringOrString(endSinceStartAddOneMinuteDuration)} - ${getDurationLocaleStringOrString(subtractDuration)}`
                    + ` = ${getDurationLocaleStringOrString(resultTimeDuration)}`;
    
    const formValues: typeof originalFormValues = { ...originalFormValues, startPlainTimeString, endPlainTimeString, currentSubtractPlainTimeString };
    return { formValues, resultTimeDuration, resultText };
}

type ProjectsDurationsItem = {
    projectName: string;
    resultTimeDuration: Temporal.Duration;
};

type GetDetailDurationSummaryParams = {
    totalDurationsSummary: TotalDurationsSummaryItem[];
    projectsDurations: ProjectsDurationsItem[];
}
const getDetailDurationSummary = ({ projectsDurations, totalDurationsSummary }: GetDetailDurationSummaryParams): DetailDurationsSummaryItem[] => {
    const totalLackDurationHoursResult = totalDurationsSummary.find((item) => item.id === TOTAL_LACK_DURATION_HOURS_RESULT);

    if (!totalLackDurationHoursResult) {
        alertUtil(`total lack duration summary item is not exist`);
        return [];
    }

    const durationMinutesTotal = totalLackDurationHoursResult.durationMinutes;
    if (!durationMinutesTotal) {
        alertUtil(`duration of total is not exist`);
        return [];
    }

    const baseDetailDurationsSummary = Object.entries(Object.groupBy(projectsDurations, (i) => i.projectName))
    .map<DetailDurationsSummaryItem>(([projectName, projectDurations]) => {
         const id = `${projectName}`;

        if (!projectDurations) {
            return {
                id,
                name: projectName,
                durationString: `durations of project is not exist`,
                finalHourChangeable: false,
            };
        }

        // current project durations addition expression(xx + xx....)
        const projectDurationsString = projectDurations
                                        ?.map(({ resultTimeDuration: d }) => getDurationLocaleStringOrString(d))
                                        .join(' + ');

        // current project durations addition result
        const projectTotalDuration = projectDurations.reduce((pre, item) => pre.add(item.resultTimeDuration), new Temporal.Duration());

        // current project durations addition result number(x.xxx)
        const projectTotalDurationHour = projectTotalDuration.total('hours');

        const finalHourValue = formatSpentWorkHourForInput(projectTotalDurationHour);

        return {
            id,
            name: projectName,
            durationString: `${projectDurationsString} = ${getDurationLocaleStringOrString(projectTotalDuration)}(${projectTotalDurationHour.toLocaleString()})`,
            finalHourChangeable: true,
            finalHour: { value: finalHourValue, min: '0', max: finalHourValue, required: true },
        };
    });

    // sum durations(every projects)
    const projectsDuration = projectsDurations.reduce((pre, item) => pre.add(item.resultTimeDuration), new Temporal.Duration());

    // duration per day - sum durations(every projects)
    const lackDurationDetail = DURATION_PER_DAY.subtract(projectsDuration);
    
    const projectsDurationMinutes = projectsDuration.total('minutes');
    if (projectsDurationMinutes > durationMinutesTotal) {
        alertUtil(`projects duration(${projectsDurationMinutes}) should not longer than total duration(${durationMinutesTotal})`);
        return [];
    }

    return [
        ...baseDetailDurationsSummary,
        {
            id: DETAIL_LACK_DURATION,
            name: "缺",
            durationString: `${DURATION_PER_DAY_STRING} - ${getDurationLocaleStringOrString(projectsDuration)}(sum)`
            + ` = ${getDurationLocaleStringOrString(lackDurationDetail)}(${lackDurationDetail.total('hours').toLocaleString()})`,
            finalHourChangeable: false,
        },
        getDetailLackDurationHourSummary({ subtractDetailDurationsSummary: baseDetailDurationsSummary }),
    ];
}

type ValidateDetailWithTotalTimeRangeParams = {
    dayString: string;
    subtractPlainTimeStringInTotal: string;
    totalTimeRanges: TotalTimeRangeType[];
    detailTimeRanges: DetailTimeRangeType[];
}
const validateDetailTimeRangesWithTotal = ({ dayString, subtractPlainTimeStringInTotal, totalTimeRanges, detailTimeRanges }: ValidateDetailWithTotalTimeRangeParams) => {
    if (totalTimeRanges.length === 0) {
        alertUtil(`total time range should input first`);
        return false;
    }
    
    const totalStart = totalTimeRanges.at(0)?.formValues.startPlainTimeString;
    const totalEnd = totalTimeRanges.at(-1)?.formValues.endPlainTimeString;

    const notExists: string[] = [];

    if (!totalStart) {
        notExists.push(`start time of total time range`);
    }
    if (!totalEnd) {
        notExists.push(`end time of total time range`);
    }
    if ((!totalStart) || (!totalEnd)) {
        const errorMessage = `${notExists.join(', ')} ${notExists.length > 1 ? 'are' : 'is'} not exist(day: ${dayString})`;
        alertUtil(errorMessage);
        return false;
    }

    if (detailTimeRanges.length === 0) {
        alertUtil(`detail time range should not be empty`);
        return false;
    }
    
    const detailStart = detailTimeRanges.at(0)?.formValues.startPlainTimeString;
    const detailEnd = detailTimeRanges.at(-1)?.formValues.endPlainTimeString;
    const detailEndSubtract = detailTimeRanges.at(-1)?.formValues.currentSubtractPlainTimeString;

    if (!detailStart) {
        notExists.push(`start of detail time range`);
    }
    if (!detailEnd) {
        notExists.push(`end of detail time range`);
    }
    if (!detailEndSubtract) {
        notExists.push(`subtract of detail time range`);
    }
    if ((!detailStart) || (!detailEnd) || (!detailEndSubtract)) {
        const errorMessage = `${notExists.join(', ')} ${notExists.length > 1 ? 'are' : 'is'} not exist(day: ${dayString})`;
        alertUtil(errorMessage);
        return false;
    }

    // success: time1 comes before time2 && time1 and time2 are same;
    // failed: time1 comes after time2
    const startCompare = Temporal.PlainTime.compare(totalStart, detailStart);
    const startSuccess = (startCompare === -1) || (startCompare === 0);
    
    const endCompare = Temporal.PlainTime.compare(detailEnd, totalEnd);
    const endSuccess = (endCompare === -1) || (endCompare === 0);

    const detailEndSubtractDuration = temporalPlainTimeFrom(detailEndSubtract).since(new Temporal.PlainTime());
    const subtractDurationInTotal = temporalPlainTimeFrom(subtractPlainTimeStringInTotal).since(new Temporal.PlainTime());
    // success: duration1 shorter than duration2 && duration1 and duration2 are equal;
    // failed: duration1 longer than duration2
    const subtractCompare = Temporal.Duration.compare(subtractDurationInTotal, detailEndSubtractDuration);
    const subtractSuccess = (subtractCompare === -1) || (subtractCompare === 0);
    
    const errorMessages: string[] = [];
    if (!startSuccess) {
        errorMessages.push(`total start time(${totalStart}) comes after detail start time(${detailStart})`);
    }
    
    if (!endSuccess) {
        errorMessages.push(`detail end time(${detailEnd}) comes after total end time(${totalEnd})`);
    }

    if (!subtractSuccess) {
        errorMessages.push(`detail end subtract (${detailEndSubtract}) should not be shorter than total subtract(${subtractPlainTimeStringInTotal})`);
    }
    
    if (errorMessages.length > 0) {
        const errorMessage = `${errorMessages.join(', ')}(day: ${dayString})`;
        alertUtil(errorMessage);
        return false;
    }

    return true;
}
type GetCalculatedDetailOfDayParams = {
    dayString: string;
    beforeCalculateDetail: DayDetailType;
    total: DayTotalType;
}
export const getCalculatedDetailDay = ({ dayString, beforeCalculateDetail, total }: GetCalculatedDetailOfDayParams): DayDetailType => {
    const success = validateDetailTimeRangesWithTotal({ dayString, subtractPlainTimeStringInTotal: total.subtractPlainTimeString, detailTimeRanges: beforeCalculateDetail.detailTimeRanges, totalTimeRanges: total.totalTimeRanges });
    if (!success) {
        return { ...beforeCalculateDetail, detailDurationsSummary: [] };
    }

    const projectsDurations: ProjectsDurationsItem[] = [];

    const { validateSuccess, detailTimeRanges } = beforeCalculateDetail.detailTimeRanges.reduce<{ validateSuccess: boolean; detailTimeRanges: DetailTimeRangeType[] }>((pre, detailTimeRange, i, array) => {

        const { success, message } = validateDetailTimeRange({ dayString, currentIndex: i, detailTimeRanges: array });

        if (!success) {
            return { validateSuccess: false, detailTimeRanges: [...pre.detailTimeRanges, { ...detailTimeRange, resultText: message }] };
        }

        const previousSubtractTime = i === 0 ? "00:00" : array[i-1]?.formValues.currentSubtractPlainTimeString as string;
        const {
            formValues,
            resultTimeDuration,
            resultText,
        } = getDetailDuration({ formValues: detailTimeRange.formValues, previousSubtractTime });

        // TODO: 把验证提取出去
        if (resultTimeDuration.sign === -1) {
            const errorMessage = `result(index:${i}) should not be negative(day: ${dayString})`;
            alertUtil(errorMessage);
            return { validateSuccess: false, detailTimeRanges: [...pre.detailTimeRanges, { ...detailTimeRange, resultText: errorMessage }] };
        }
        projectsDurations.push({ projectName: detailTimeRange.formValues.projectName, resultTimeDuration });

        return { validateSuccess: pre.validateSuccess === false ? false : true, detailTimeRanges: [...pre.detailTimeRanges, { ...detailTimeRange, formValues, resultText }] };

    }, { validateSuccess: true, detailTimeRanges: [] });

    if (!validateSuccess) {
        projectsDurations.length = 0;
        return { ...beforeCalculateDetail, detailTimeRanges, detailDurationsSummary: [] };
    }
    
    const detailDurationsSummary = getDetailDurationSummary({ projectsDurations, totalDurationsSummary: total.totalDurationsSummary });

    return { ...beforeCalculateDetail, detailTimeRanges, detailDurationsSummary };
}

type ChangeDetailToMarkdownTextParams = {
    months: MonthType[];
}
export const changeDetailToMarkdownText = ({ months }: ChangeDetailToMarkdownTextParams) => {
    const separatorAndNoteLabel = `-------备注：`;

    const detailMarkdownText = months.reduce((pre, month, monthIndex) => {

        const daysString = month.days.reduce((preDaysString, day) => {
            const dayNote = day.dayNote;
            const dayNoteString = dayNote ? `${separatorAndNoteLabel}${dayNote}` : '';

            const detailTimeRanges = day.detail.detailTimeRanges;
            const detailDurationsSummary = day.detail.detailDurationsSummary;

            const detailTimeRangesString = detailTimeRanges.reduce((preDetailTimeRangesString, detailTimeRange)=> {
                const projectName = detailTimeRange.formValues.projectName;
                const start = detailTimeRange.formValues.startPlainTimeString;
                const end = detailTimeRange.formValues.endPlainTimeString;
                const subtract = detailTimeRange.formValues.currentSubtractPlainTimeString;
                const resultText = detailTimeRange.resultText;
                return `${preDetailTimeRangesString}\n\t- (${projectName})${start}-${end}(減去${subtract}) | ${resultText}`;
            }, '');

            const detailDurationsSummaryString = detailDurationsSummary.reduce((preDetailDurationsSummaryString, detailDurationSummary)=> {
                const name = detailDurationSummary.name;
                const durationString = detailDurationSummary.durationString;
                const finalHourValue = detailDurationSummary.finalHourChangeable ? detailDurationSummary.finalHour.value : '';
                
                if (finalHourValue) {
                    return `${preDetailDurationsSummaryString}\n\t- ${name}: ${durationString}-------${finalHourValue}`;
                }
                return `${preDetailDurationsSummaryString}\n\t- ${name}: ${durationString}`;
            }, '');

            return `${preDaysString}\n\n- ${day.dayString}${dayNoteString}${detailTimeRangesString}\n${detailDurationsSummaryString}`;
        }, '');
        
        const currentMonthDaysHour = month.days.map((day) => {
            const detailDurationsSummary = day.detail.detailDurationsSummary;

            const subString = detailDurationsSummary.reduce((daysSubStringPre, detailDurationsSummaryItem) => {
                if ([DETAIL_LACK_DURATION, DETAIL_LACK_DURATION_HOURS_RESULT].includes(detailDurationsSummaryItem.id)) {
                    return daysSubStringPre;
                }
                
                const hour = detailDurationsSummaryItem.finalHourChangeable ? detailDurationsSummaryItem.finalHour.value : '';
                
                return `${daysSubStringPre}\n\t\t- ${detailDurationsSummaryItem.name}: ${hour === '' ? 'not exist' : hour}`;
            }, ``);

            const detailLackDurationHourSummaryItem = detailDurationsSummary.find((item) => item.id === DETAIL_LACK_DURATION_HOURS_RESULT);
            const lackHour = detailLackDurationHourSummaryItem?.finalHourChangeable ? detailLackDurationHourSummaryItem.finalHour.value : '';
            
            return { id: day.id, dayString: day.dayString, dayNote: day.dayNote, lackHour, lackDurationString: detailLackDurationHourSummaryItem?.durationString, subString };
        });
        
        const currentMonthDaysHourString = currentMonthDaysHour.reduce((daysHourStringPre, item) => {
            const hour = item.lackHour;
            const hourString = hour === '' ? 'not exist' : hour;
            const lackDurationString = (item.lackDurationString !== undefined) ? `  (${item.lackDurationString})` : '';

            const dayNote = item.dayNote;
            const dayNoteString = dayNote ? `${separatorAndNoteLabel}${dayNote}` : '';

            return `${daysHourStringPre}\n\n\t- ${item.dayString}: ${hourString}${lackDurationString}${dayNoteString}${item.subString}`;
        }, '- 当月请假汇总: ');

        const baseString = `${pre}${monthIndex === 0 ? '' : '\n\n\n'}### ${month.monthString}${daysString}\n\n${currentMonthDaysHourString}\n\n\t- 总和: `;

        const emptyHourDays = currentMonthDaysHour.filter((item) => item.lackHour === '');
        if (emptyHourDays.length > 0) {
            const message = `empty hour(${emptyHourDays.map((item) => item.dayString).join(', ')})`;
            alertUtil(message);
            return `${baseString}${message}`;
        }
        

        const totalHourNumberAndHoursString = currentMonthDaysHour.reduce((pre, item, index) => {
            const hour = item.lackHour;

            const totalHour = pre.totalHour + Number(hour);

            if (index === 0) {
                return { totalHour, hours: `${pre.hours}${hour}` };
            }

            return { totalHour, hours: `${pre.hours} + ${hour}` };

        }, { totalHour: 0, hours: '' });

        return `${baseString}${totalHourNumberAndHoursString.totalHour}(${totalHourNumberAndHoursString.hours})`;

    }, '');

    return detailMarkdownText;
};