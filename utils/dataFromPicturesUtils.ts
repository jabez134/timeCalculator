import { alertUtil, getDurationLocaleStringOrString, getPlainTimeString, temporalPlainDateFrom, temporalPlainTimeFrom } from "./utils";
import { getJPEGDataFromArrayBuffer } from "./imageUtils";

type GetTotalDurationsParams = {
    times: { start: string; end: string };
}
const getDurationAndResultText = ({ times }: GetTotalDurationsParams) => {
    const startPlainTime = temporalPlainTimeFrom(times.start);
    const startPlainTimeAddOneMinute = startPlainTime.add({ minutes: 1 });
    const endPlainTime = temporalPlainTimeFrom(times.end);
    const endSinceStartAddOneMinuteDuration = endPlainTime.since(startPlainTimeAddOneMinute); // start time(+1) ~ end time

    // string
    const startPlainTimeAddOneMinuteString = getPlainTimeString(startPlainTimeAddOneMinute);
    const endPlainTimeString = getPlainTimeString(endPlainTime);
    const endSinceStartDurationLocaleStringOrString = getDurationLocaleStringOrString(endSinceStartAddOneMinuteDuration);

    const resultText = `${endPlainTimeString}减${startPlainTimeAddOneMinuteString} = ${endSinceStartDurationLocaleStringOrString}`;

    return { endSinceStartAddOneMinuteDuration, resultText };
}

const getDateTimeFromFileNames = async ({ files }: { files: FormDataEntryValue[] }) => {
    // const regExp = /^IMG_(?<Date>\d{8})_(?<Time>\d{6})\.jpg$/;
    const jpegFileNameRegExp = /^IMG_\d{8}_\d{6}\.jpg$/;
    const jpegFileNameStartRegExp = /^IMG_/;
    const jpegFileNameEndRegExp = /\.jpg$/;

    const dateTimePromises = files.map(async (fileItem) => {
        if (typeof fileItem === 'string') {
            const message = `${fileItem} is not a file`;
            alertUtil(message);
            return Promise.reject(message);
        }

        const fileName = fileItem.name;
        const testResult = jpegFileNameRegExp.test(fileName);
        if (!testResult) {
            const message = `file name(${fileName}) should be ${jpegFileNameRegExp}`;
            alertUtil(message);
            return Promise.reject(message);
        }


        const [date, time] = fileName.replace(jpegFileNameEndRegExp, '').replace(jpegFileNameStartRegExp, '').split('_');
        if ((!date) || (!time)) {
            const message = `date(${date}) or time(${time}) in file name(${fileName}) is not exist`;
            alertUtil(message);
            return Promise.reject(message);
        }

        const yearFromFileName = date.slice(0,4);
        const monthFromFileName = date.slice(4,6);
        const dayFromFileName = date.slice(6);
        const fixedDate = `${yearFromFileName}-${monthFromFileName}-${dayFromFileName}`;
        const fixedTime = `${time.slice(0,2)}:${time.slice(2,4)}:${time.slice(4)}`;

        return fileItem.arrayBuffer().then((fileArrayBuffer) => {
            const resultFromArrayBuffer = getJPEGDataFromArrayBuffer({ fileArrayBuffer });
            console.log('resultFromArrayBuffer', resultFromArrayBuffer);
            
            if (!resultFromArrayBuffer.success) {
                return Promise.reject(resultFromArrayBuffer.message);
            }
            const { dateTime, dateTimeOriginal, dateTimeDigitized } = resultFromArrayBuffer.data;
            if (!dateTime.success) {
                return Promise.reject(dateTime.message);
            }
            if (!dateTimeOriginal.success) {
                return Promise.reject(dateTimeOriginal.message);
            }
            if (!dateTimeDigitized.success) {
                return Promise.reject(dateTimeDigitized.message);
            }

            const dateTimeValue = dateTime.value;
            const dateTimeOriginalValue = dateTimeOriginal.value;
            const dateTimeDigitizedValue = dateTimeDigitized.value;
            if ((dateTimeValue !== dateTimeOriginalValue) || (dateTimeValue !== dateTimeDigitizedValue)) {
                return Promise.reject(`${dateTime.name}(${dateTimeValue}), ${dateTimeOriginal.name}(${dateTimeOriginalValue}), ${dateTimeDigitized.name}(${dateTimeDigitizedValue}) is not equal`);
            }

            const dateTimeFromFileNameForCompare = `${yearFromFileName}:${monthFromFileName}:${dayFromFileName} ${fixedTime}\x00`;
            if (dateTimeValue !== dateTimeFromFileNameForCompare) {
                return Promise.reject(`date time from array buffer(${dateTimeValue}) and file name is not equal`);
            }
            
            return {
                name: fileName,
                date: fixedDate,
                time: fixedTime,
                dateTime: `${fixedDate}T${fixedTime}`,
            };
        });
    });

    const dateTimes = await Promise.all(dateTimePromises);

    const compareDateTimesResult = dateTimes.every((item, index, arr) => {
        const date = item.date;
        if (date === 'null') {
            return false;
        }
        
        if (index === 0) {
            return true;
        }

        const previousItemDateTime = arr[index-1]?.dateTime;
        if (!previousItemDateTime) {
            alertUtil(`previous item(${previousItemDateTime}) is not exist`);
            return false;
        }
        
        // success: previousItemDateTime comes before item.dateTime && previousItemDateTime and item.dateTime are same;
        // failed: previousItemDateTime comes after item.dateTime
        const compareResult = Temporal.PlainDateTime.compare(previousItemDateTime, item.dateTime); // -1: dateTime1 comes before dateTime2
        const compareSuccess = (compareResult === -1) || (compareResult === 0);
        if (!compareSuccess) {
            alertUtil(`order of date times is incorrect`);
        }
        return compareSuccess;
    });

    if (!compareDateTimesResult) {
        return [];
    }

    return dateTimes;
}

const getFixedDatesTimes = async ({ files }: { files: FormDataEntryValue[] }) => {
    const dateTimes = await getDateTimeFromFileNames({ files });
    
    const originalDateTimes = Object.entries(Object.groupBy(dateTimes, i => i.date)).map(([date, arr]) => ({ date, times: arr ?? [] }));
    const fixedDateTimes: typeof originalDateTimes = [];
    
    originalDateTimes.forEach(({ date, times }) => {
        const fixedDatesTimeRangesItem = fixedDateTimes.find((i) => i.date === date);

        if (fixedDatesTimeRangesItem) {
            alertUtil(`Now, date(${date}) should not exist in fixed array`);
            return;
        }
        
        const firstTime = times[0];
        
        if (!firstTime) {
            fixedDateTimes.push({ date, times });
            return;
        }

        const currentDayFirstTimeRangeHourNumber = Number(firstTime.time.slice(0,2));
        if (currentDayFirstTimeRangeHourNumber > 5) {
            fixedDateTimes.push({ date, times });
            return;
        }

        // first time of current day should be end time of previous day
        const previousDate = temporalPlainDateFrom(date).subtract({ days: 1 }, { overflow: 'reject' }).toString();
        const fixedPreviousDateDatesTimeRangesItem = fixedDateTimes.find((i) => i.date === previousDate);

        if (!fixedPreviousDateDatesTimeRangesItem) {
            // add previous date
            fixedDateTimes.push({ date: previousDate, times: [firstTime] });
        } else {
            // add first time(current date) to previous date
            fixedPreviousDateDatesTimeRangesItem.times = [...fixedPreviousDateDatesTimeRangesItem.times, firstTime];
        }

        // add current date(DO NOT before previous date, because push)
        fixedDateTimes.push({ date, times: times.slice(1) });
    });

    return fixedDateTimes;
};

export const changeDataFromFileNameToMarkdownText = async ({ files }: { files: FormDataEntryValue[] }) => {
    const datesTimes = await getFixedDatesTimes({ files });
    
    const markdownText = datesTimes.reduce((pre, dateTimeRanges, dateIndex) => {
        const currentDate = dateTimeRanges.date;

        const fixedTimes = dateTimeRanges.times.map((time, timeIndex, timesArray) => {
            if (time.date !== currentDate) {
                if (timeIndex === (timesArray.length - 1)) {
                    return { time: '23:59' };
                }
                const message = `incorrect time order(file name: ${time.name})`;
                alertUtil(message);
                return { time: message };
            }

            return { time: time.time.slice(0,5) };
        });

        const totalTimeRangeDurations: Temporal.Duration[] = [];

        const daysString = fixedTimes.reduce((preDaysString, time, timeIndex, timesArray) => {
            const currentTimeText = time.time;
            
            if (timeIndex % 2 === 0) {
                return `${preDaysString}\n\t- ${currentTimeText}`;
            }

            const startTimeText = timesArray[timeIndex - 1]?.time;
            const endTimeText = currentTimeText;
            
            if (!startTimeText) {
                const message = `start time is not exist`;
                alertUtil(message);
                return `${preDaysString}-${currentTimeText} | result: ${message}`;
            }

            const { resultText, endSinceStartAddOneMinuteDuration } = getDurationAndResultText({ times: { start: startTimeText, end: endTimeText } });
            totalTimeRangeDurations.push(endSinceStartAddOneMinuteDuration);

            return `${preDaysString}-${currentTimeText} | result: ${resultText}`;
        }, '');

        // sum durations(every time ranges)
        const totalTimeRangesDuration = totalTimeRangeDurations.reduce((pre, item) => pre.add(item), new Temporal.Duration());

        const durationString = `${
            totalTimeRangeDurations.length > 0 ? totalTimeRangeDurations.map(getDurationLocaleStringOrString).join(' + ') : getDurationLocaleStringOrString(totalTimeRangesDuration)
        } = ${getDurationLocaleStringOrString(totalTimeRangesDuration)}`;
     
        return `${pre}${dateIndex === 0 ? '' : '\n\n'}- ${dateTimeRanges.date}${daysString}\n\n\t- 时间段相加: ${durationString}`;
    }, '');

    return markdownText;
};
