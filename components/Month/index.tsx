import Day from "../Day";
import AddPopDay from "../AddPopDay";

import { getCalculatedDetailDay, getDetailLackDurationHourSummary, getInitialDetailTimeRange } from "../../utils/detailDataUtils";
import { getCalculatedTotalOfDay, getInitialTotalTimeRange } from "../../utils/totalDataUtils";
import { alertUtil, getAddedPlainDateString, getInitialDay, isInRange, temporalPlainYearMonthFrom, toPopForArray } from "../../utils/utils";
import { DETAIL_LACK_DURATION_HOURS_RESULT } from "../../utils/constants";

import styles from './index.module.css';

type GetChangedMonthsBaseParams = {
    changedMonthId: string;
    changedDayId: string;
    monthsPrevious: MonthType[];
};
type GetChangedMonthsParams = GetChangedMonthsBaseParams & (
    {
        changedTimeRangesType: 'TOTAL';
        changedType: 'ADD' | 'POP' | 'CALCULATE_SUMMARY' | 'CLEAR_SUMMARY';
    } | {
        changedTimeRangesType: 'TOTAL';
        changedType: 'FORM_VALUES_SUBMIT';
        changedRangeId: string;
        values: TotalTimeRangeFormValues;
    } | {
        changedTimeRangesType: 'TOTAL';
        changedType: 'SUBTRACT_PLAIN_TIME_STRING_CHANGE';
        subtractPlainTimeString: string;
    } | {
        changedTimeRangesType: 'DETAIL';
        changedType: 'ADD' | 'POP' | 'CALCULATE_SUMMARY' | 'CLEAR_SUMMARY';
    } | {
        changedTimeRangesType: 'DETAIL';
        changedType: 'FORM_VALUES_SUBMIT';
        changedRangeId: string;
        values: DetailTimeRangeFormValues;
    } | {
        changedTimeRangesType: 'DETAIL';
        changedType: 'SUMMARY_FINAL_HOUR_SUBMIT';
        changedSummaryId: string;
        finalHourValue: FinalHourType['value'];
    }
);
const getChangedMonths = (params: GetChangedMonthsParams): MonthType[] => {
    return params.monthsPrevious.map<MonthType>((monthPrevious) => {
        if (monthPrevious.id !== params.changedMonthId) return monthPrevious;
        
        if (params.changedTimeRangesType === 'DETAIL') {
            const changedDays = monthPrevious.days.map<DayType>((dayPrevious) => {
                if (dayPrevious.id !== params.changedDayId) return dayPrevious;

                if (params.changedType === 'SUMMARY_FINAL_HOUR_SUBMIT') {

                    const detailDurationsSummary = dayPrevious.detail.detailDurationsSummary.map<DetailDurationsSummaryItem>((itemPrev) => {
                        if (itemPrev.id !== params.changedSummaryId) return itemPrev;

                        if (!itemPrev.finalHourChangeable) {
                            alertUtil(`Final hour of ${itemPrev.name}(id: ${itemPrev.id}) in ${dayPrevious.dayString} is not changeable.`);
                            return itemPrev;
                        }

                        const value = params.finalHourValue;
                        const { min, max } = itemPrev.finalHour;

                        if ((params.changedSummaryId === DETAIL_LACK_DURATION_HOURS_RESULT) && (value === '')) {
                                return { ...itemPrev, finalHour: { ...itemPrev.finalHour, value } };
                        }
                        if (value === '') {
                            alertUtil(`the value of ${itemPrev.name} should not be empty`);
                            return itemPrev;
                        }

                        if (!Number.isFinite(Number(value))) {
                            alertUtil(`incorrect hour(value: ${value}) of ${itemPrev.name}(id: ${itemPrev.id}) in ${dayPrevious.dayString}.`);
                            return itemPrev;
                        }

                        const inRange = isInRange({ min, max, value });
                        if (!inRange) {
                            alertUtil(`the range of value(${value}) should be [${min}, ${max}]`);
                            return itemPrev;
                        }
                     
                        return { ...itemPrev, finalHour: { ...itemPrev.finalHour, value } };
                    });

                    if (params.changedSummaryId === DETAIL_LACK_DURATION_HOURS_RESULT) {
                        return { ...dayPrevious, detail: { ...dayPrevious.detail, detailDurationsSummary } };
                    }

                    const baseDetailDurationsSummary = detailDurationsSummary.filter((item) => item.id !== DETAIL_LACK_DURATION_HOURS_RESULT);
                    
                    return {
                        ...dayPrevious,
                        detail: {
                            ...dayPrevious.detail,
                            detailDurationsSummary: [
                                ...baseDetailDurationsSummary,
                                getDetailLackDurationHourSummary({ subtractDetailDurationsSummary: baseDetailDurationsSummary }),
                            ],
                        },
                    };
                }

                if (params.changedType === 'CALCULATE_SUMMARY') {
                    return {
                        ...dayPrevious,
                        detail: getCalculatedDetailDay({ beforeCalculateDetail: dayPrevious.detail, total: dayPrevious.total, dayString: dayPrevious.dayString }),
                    };
                }

                if (params.changedType === 'CLEAR_SUMMARY') {
                    return { ...dayPrevious, detail: { ...dayPrevious.detail, detailDurationsSummary: [] } };
                }

                let detailTimeRanges = [...dayPrevious.detail.detailTimeRanges];

                if (params.changedType === 'FORM_VALUES_SUBMIT') {
                    return {
                        ...dayPrevious,
                        detail: {
                            ...dayPrevious.detail,
                            detailTimeRanges: detailTimeRanges.map((rangePrev) => {
                                if (rangePrev.id !== params.changedRangeId) return rangePrev;

                                return { ...getInitialDetailTimeRange({ id: rangePrev.id }), formValues: { ...params.values, projectName: params.values.projectName.trim() } };
                            }),
                            detailDurationsSummary: [],
                        },
                    };
                }

                if (params.changedType === 'ADD') {
                    detailTimeRanges = [...detailTimeRanges, getInitialDetailTimeRange({ id: `${detailTimeRanges.length + 1}` })];
                }
                if (params.changedType === 'POP') {
                    detailTimeRanges = toPopForArray(detailTimeRanges);
                }

                return { ...dayPrevious, detail: { ...dayPrevious.detail, detailTimeRanges, detailDurationsSummary: [] } };
            });
            return { ...monthPrevious, days: changedDays };
        }

        if (params.changedTimeRangesType === 'TOTAL') {
            const changedDays = monthPrevious.days.map<DayType>((dayPrevious) => {
                if (dayPrevious.id !== params.changedDayId) return dayPrevious;

                if (params.changedType === 'SUBTRACT_PLAIN_TIME_STRING_CHANGE') {
                    return {
                        ...dayPrevious,
                        total: {
                            ...dayPrevious.total,
                            subtractPlainTimeString: params.subtractPlainTimeString,
                            totalDurationsSummary: [],
                        },
                    }
                }

                if (params.changedType === 'CALCULATE_SUMMARY') {
                    return {
                        ...dayPrevious,
                        total: getCalculatedTotalOfDay({ beforeCalculateTotal: dayPrevious.total, dayString: dayPrevious.dayString }),
                    };
                }

                if (params.changedType === 'CLEAR_SUMMARY') {
                    return { ...dayPrevious, total: { ...dayPrevious.total, totalDurationsSummary: [] } };
                }

                let totalTimeRanges = [...dayPrevious.total.totalTimeRanges];

                if (params.changedType === 'FORM_VALUES_SUBMIT') {
                    return {
                        ...dayPrevious,
                        total: {
                            ...dayPrevious.total,
                            totalTimeRanges: totalTimeRanges.map((rangePrev) => {
                                if (rangePrev.id !== params.changedRangeId) return rangePrev;

                                return { ...getInitialTotalTimeRange({ id: rangePrev.id }), formValues: params.values };
                            }),
                            totalDurationsSummary: [],
                        }
                    };
                }

                if (params.changedType === 'ADD') {
                    totalTimeRanges = [...totalTimeRanges, getInitialTotalTimeRange({ id: `${totalTimeRanges.length + 1}` })];
                }
                if (params.changedType === 'POP') {
                    totalTimeRanges = toPopForArray(totalTimeRanges);
                }

                return { ...dayPrevious, total: { ...dayPrevious.total, totalTimeRanges, totalDurationsSummary: [] } };
            });
            return { ...monthPrevious, days: changedDays };
        }

        return monthPrevious;
    });
};

type Props = {
    monthId: string;
    monthString: string;
    editingId: string;
    days: DayType[];
    onChangeEditingId: React.Dispatch<React.SetStateAction<string>>;
    onChangeMonths: React.Dispatch<React.SetStateAction<MonthType[]>>;
};
function Month({ monthId, editingId, monthString, days, onChangeEditingId, onChangeMonths }: Props) {
    return (
        <div className={styles.wrapper}>
            <div>Month: {monthString}</div>
            {days.map((d) => {
                const dayId = d.id;
                return (
                    <Day
                        editingId={editingId}
                        monthId={monthId}
                        key={dayId}
                        {...d}
                        onChangeDayNote={(changedText) => {
                            onChangeMonths((monthsPrevious) => {
                                return monthsPrevious.map((monthPrevious) => {
                                    if (monthPrevious.id !== monthId) return monthPrevious;
                                    const changedDays = monthPrevious.days.map((dayPrevious) => {
                                        if (dayPrevious.id !== dayId) return dayPrevious;
                                        return { ...dayPrevious, dayNote: changedText };
                                    });
                                    return { ...monthPrevious, days: changedDays };
                                });
                            });
                        }}
                        onChangeEditingId={onChangeEditingId}

                        // Detail
                        onClickAddDetailTimeRange={() => {
                            onChangeEditingId('');
                            onChangeMonths((monthsPrevious) => {
                                return getChangedMonths({ changedType: 'ADD', changedTimeRangesType: 'DETAIL', changedMonthId: monthId, changedDayId: dayId, monthsPrevious });
                            });
                        }}
                        onClickPopDetailTimeRange={() => {
                            onChangeEditingId('');
                            onChangeMonths((monthsPrevious) => {
                                return getChangedMonths({ changedType: 'POP', changedTimeRangesType: 'DETAIL', changedMonthId: monthId, changedDayId: dayId, monthsPrevious });
                            });
                        }}
                        onClickCalculateDetailDurationsSummary={() => {
                            onChangeEditingId('');
                            onChangeMonths((monthsPrevious) => {
                                return getChangedMonths({ changedType: 'CALCULATE_SUMMARY', changedTimeRangesType: 'DETAIL', changedMonthId: monthId, changedDayId: dayId, monthsPrevious });
                            });
                        }}
                        onClickClearDetailDurationsSummary={() => {
                            onChangeEditingId('');
                            onChangeMonths((monthsPrevious) => {
                                return getChangedMonths({ changedType: 'CLEAR_SUMMARY', changedTimeRangesType: 'DETAIL', changedMonthId: monthId, changedDayId: dayId, monthsPrevious });
                            });
                        }}
                        onSubmitDetailTimeRangeFormValues={({ id, values }) => {
                            onChangeEditingId('');
                            onChangeMonths((monthsPrevious) => {
                                return getChangedMonths({ changedType: 'FORM_VALUES_SUBMIT', changedTimeRangesType: 'DETAIL', changedMonthId: monthId, changedDayId: dayId, changedRangeId: id, values, monthsPrevious });
                            });
                        }}
                        onSubmitDetailSummaryFinalHourValue={({ id, finalHourValue }) => {
                            onChangeEditingId('');
                            onChangeMonths((monthsPrevious) => {
                                return getChangedMonths({ changedType: 'SUMMARY_FINAL_HOUR_SUBMIT', changedTimeRangesType: 'DETAIL', changedMonthId: monthId, changedDayId: dayId, changedSummaryId: id, finalHourValue, monthsPrevious });
                            });
                        }}

                        // Total
                        onClickAddTotalTimeRange={() => {
                            onChangeEditingId('');
                            onChangeMonths((monthsPrevious) => {
                                return getChangedMonths({ changedType: 'ADD', changedTimeRangesType: 'TOTAL', changedMonthId: monthId, changedDayId: dayId, monthsPrevious });
                            });
                        }}
                        onClickPopTotalTimeRange={() => {
                            onChangeEditingId('');
                            onChangeMonths((monthsPrevious) => {
                                return getChangedMonths({ changedType: 'POP', changedTimeRangesType: 'TOTAL', changedMonthId: monthId, changedDayId: dayId, monthsPrevious });
                            });
                        }}
                        onClickCalculateTotalDurationsSummary={() => {
                            onChangeEditingId('');
                            onChangeMonths((monthsPrevious) => {
                                return getChangedMonths({ changedType: 'CALCULATE_SUMMARY', changedTimeRangesType: 'TOTAL', changedMonthId: monthId, changedDayId: dayId, monthsPrevious });
                            });
                        }}
                        onClickClearTotalDurationsSummary={() => {
                            onChangeEditingId('');
                            onChangeMonths((monthsPrevious) => {
                                return getChangedMonths({ changedType: 'CLEAR_SUMMARY', changedTimeRangesType: 'TOTAL', changedMonthId: monthId, changedDayId: dayId, monthsPrevious });
                            });
                        }}
                        onSubmitTotalTimeRangeFormValues={({ id, values }) => {
                            onChangeEditingId('');
                            onChangeMonths((monthsPrevious) => {
                                return getChangedMonths({ changedType: 'FORM_VALUES_SUBMIT', changedTimeRangesType: 'TOTAL', changedMonthId: monthId, changedDayId: dayId, changedRangeId: id, values, monthsPrevious });
                            });
                        }}
                        onTotalSubtractPlainTimeStringChange={(v) => {
                            onChangeEditingId('');
                            onChangeMonths((monthsPrevious) => {
                                return getChangedMonths({ changedType: 'SUBTRACT_PLAIN_TIME_STRING_CHANGE', changedTimeRangesType: 'TOTAL', changedMonthId: monthId, changedDayId: dayId, subtractPlainTimeString: v, monthsPrevious });
                            });
                        }}
                    />
                )
            })}
            <AddPopDay
                min={getAddedPlainDateString(days.at(-1)?.dayString) ?? `${monthString}-01`}
                max={`${monthString}-${temporalPlainYearMonthFrom(monthString).daysInMonth}`}
                onAddDay={({ addedDayString }) => {
                    if (days.some(i => i.dayString === addedDayString)) {
                        return { success: false, message: `${addedDayString} is already exist` };
                    }

                    onChangeEditingId('');
                    onChangeMonths((monthsPrevious) => {
                        return monthsPrevious.map((monthPrevious) => {
                            if (monthPrevious.id !== monthId) return monthPrevious;
                            return {
                                ...monthPrevious,
                                days: [...monthPrevious.days, getInitialDay({ previousArrayLength: monthPrevious.days.length, dayString: addedDayString })],
                            }
                        })
                    });

                    return { success: true };
                }}
                onPopDay={() => {
                    onChangeEditingId('');
                    onChangeMonths((monthsPrevious) => {
                        return monthsPrevious.map((monthPrevious) => {
                            if (monthPrevious.id !== monthId) return monthPrevious;

                            return { ...monthPrevious, days: toPopForArray(monthPrevious.days) }
                        })
                    });
                }}
            />
        </div>
    )
}

export default Month;