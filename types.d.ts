type DetailTimeRangeFormValues = {
    projectName: string;
    startPlainTimeString: string;
    endPlainTimeString: string;
    currentSubtractPlainTimeString: string;
}

type DetailTimeRangeType = {
    id: string;
    formValues: DetailTimeRangeFormValues;
    resultText?: string;
}

type FinalHourType = {
    /** 'number' or '' */
    value: string;
    /** 'number' or '' */
    max: string;
    /** 'number' or '' */
    min: string;
    required: boolean;
}

type DetailDurationsSummaryItem = {
    id: string;
    name: string;
    durationString: string;
} & ({ finalHourChangeable: true; finalHour: FinalHourType } | { finalHourChangeable: false });

type TotalTimeRangeFormValues = {
    startPlainTimeString: string;
    endPlainTimeString: string;
}
type TotalTimeRangeType = {
    id: string;
    formValues: TotalTimeRangeFormValues;
    resultText?: string;
}
type TotalDurationsSummaryItem = {
    id: string;
    name: string;
    durationString: string;
    /** for validate only */
    durationMinutes?: number;
};

type DayDetailType = {
    detailTimeRanges: DetailTimeRangeType[];
    detailDurationsSummary: DetailDurationsSummaryItem[];
};

type DayTotalType = {
    totalTimeRanges: TotalTimeRangeType[];
    subtractPlainTimeString: string;
    totalDurationsSummary: TotalDurationsSummaryItem[];
};

type DayType = {
    id: string;
    dayString: string;
    detail: DayDetailType;
    total: DayTotalType;
};

type MonthType = {
    id: string;
    monthString: string;
    days: DayType[];
}

type WorkTimeRegulationType = {
    morningStartPlainTimeString: string;
    morningEndPlainTimeString: string;
    afternoonStartPlainTimeString: string;
    afternoonEndPlainTimeString: string;
};