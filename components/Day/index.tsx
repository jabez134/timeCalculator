
import AddPopRange from '../AddPopRange';
import CalculateClear from '../CalculateClear';
import DetailDurationSummary from '../DetailDurationSummary';
import DetailTimeRange from '../DetailTimeRange';
import TotalTimeRange from '../TotalTimeRange';
import TotalTimeSubtract from '../TotalTimeSubtract';
import TotalDurationSummary from '../TotalDurationSummary';

import { DETAIL_LACK_DURATION_HOURS_RESULT, TOTAL_LACK_DURATION_HOURS_RESULT } from '../../utils/constants';

import styles from './index.module.css';

type GetDetailBaseDisabledParams = {
    totalDurationsSummary: TotalDurationsSummaryItem[];
    detailDurationsSummary: DetailDurationsSummaryItem[];
};
const getDetailBaseDisabled = ({ totalDurationsSummary, detailDurationsSummary }: GetDetailBaseDisabledParams) => {
    const errorMessages: string[] = [];

    if (totalDurationsSummary.length === 0) {

        errorMessages.push(`CAN NOT change detail time ranges when total summary is empty`);
    } else {

        const totalLackDurationHoursResult = totalDurationsSummary.find((item) => item.id === TOTAL_LACK_DURATION_HOURS_RESULT);

        if (!totalLackDurationHoursResult) {
            errorMessages.push(`CAN NOT change detail time ranges when total lack duration summary item is not exist`);
            
        } else {
            const durationMinutesTotal = totalLackDurationHoursResult.durationMinutes;
            if (!durationMinutesTotal) {
                errorMessages.push(`CAN NOT change detail time ranges when duration of total is not exist`);
            }
        }
    }
    
    const detailLackDurationHoursResult = detailDurationsSummary.find((item) => item.id === DETAIL_LACK_DURATION_HOURS_RESULT);
    const disabledBaseFinalHour = (!!detailLackDurationHoursResult?.finalHourChangeable) && (detailLackDurationHoursResult.finalHour.value !== '');

    if (disabledBaseFinalHour) {
        errorMessages.push(`CAN NOT change detail time ranges when value of ${detailLackDurationHoursResult.name} is not empty`);
    }

    if (errorMessages.length > 0) {
        return { disabled: true, message: errorMessages.join(', ') };
    }

    return { disabled: false, message: undefined };
};

type Props = DayType & {
    monthId: string;
    editingId: string;
    onChangeEditingId: (changedEditingId: string) => void;
    onClickAddDetailTimeRange: React.DOMAttributes<HTMLButtonElement>['onClick'];
    onClickCalculateDetailDurationsSummary: React.DOMAttributes<HTMLButtonElement>['onClick'];
    onClickClearDetailDurationsSummary: React.DOMAttributes<HTMLButtonElement>['onClick'];
    onClickPopDetailTimeRange: React.DOMAttributes<HTMLButtonElement>['onClick'];
    onSubmitDetailTimeRangeFormValues: (params: { id: string; values: DetailTimeRangeFormValues }) => void;
    onSubmitDetailSummaryFinalHourValue: (params: { id: string; finalHourValue: FinalHourType['value'] }) => void;

    onClickAddTotalTimeRange: React.DOMAttributes<HTMLButtonElement>['onClick'];
    onClickCalculateTotalDurationsSummary: React.DOMAttributes<HTMLButtonElement>['onClick'];
    onClickClearTotalDurationsSummary: React.DOMAttributes<HTMLButtonElement>['onClick'];
    onClickPopTotalTimeRange: React.DOMAttributes<HTMLButtonElement>['onClick'];
    onSubmitTotalTimeRangeFormValues: (params: { id: string; values: TotalTimeRangeFormValues }) => void;
    onTotalSubtractPlainTimeStringChange: (v: string) => void;
};

function Day({
    id,
    dayString,
    monthId,
    editingId,
    detail,
    total,
    onChangeEditingId,
    onClickAddDetailTimeRange,
    onClickPopDetailTimeRange,
    onClickCalculateDetailDurationsSummary,
    onClickClearDetailDurationsSummary,
    onSubmitDetailTimeRangeFormValues,
    onSubmitDetailSummaryFinalHourValue,

    onClickAddTotalTimeRange,
    onClickCalculateTotalDurationsSummary,
    onClickClearTotalDurationsSummary,
    onClickPopTotalTimeRange,
    onSubmitTotalTimeRangeFormValues,
    onTotalSubtractPlainTimeStringChange,
}: Props) {

    const subtractPlainTimeStringIdTotal = `total-${monthId}-${id}-subtractPlainTimeString`;
    const totalBaseDisabled = detail.detailDurationsSummary.length > 0;

    const { disabled: detailBaseDisabled, message: detailBaseDisabledMessage } = getDetailBaseDisabled({ totalDurationsSummary: total.totalDurationsSummary, detailDurationsSummary: detail.detailDurationsSummary });

    return (
        <div className={styles.day_wrapper}>
            Day: {dayString}
            <div className={styles.total_detail}>
                <div className={styles.total}>
                    Total:{totalBaseDisabled ? `(CAN NOT change when detail summary is not empty)` : null}
                    {
                        total.totalTimeRanges.map((item) => {
                            const currentId = `total-${monthId}-${id}-${item.id}`;

                            return (
                                    <TotalTimeRange
                                        key={item.id}
                                        readOnly={(editingId !== currentId) || totalBaseDisabled}
                                        editDisabled={(editingId !== '') || totalBaseDisabled}
                                        {...item}
                                        onClickEdit={() => {
                                            onChangeEditingId(currentId);
                                        }}
                                        onSubmitFormValues={(values) => {
                                            onSubmitTotalTimeRangeFormValues({ id: item.id, values });
                                        }}
                                    />
                            );
                        })
                    }
                    <AddPopRange
                        disabled={(editingId !== '') || totalBaseDisabled}
                        onClickAdd={onClickAddTotalTimeRange}
                        onClickPop={onClickPopTotalTimeRange}
                    />
                    <TotalTimeSubtract
                        readOnly={(editingId !== subtractPlainTimeStringIdTotal) || totalBaseDisabled}
                        editDisabled={(editingId !== '') || totalBaseDisabled}
                        formValues={{ subtractPlainTimeString: total.subtractPlainTimeString }}
                        onClickEdit={() => {
                            onChangeEditingId(subtractPlainTimeStringIdTotal);
                        }}
                        onSubmitFormValues={(values) => {
                            onTotalSubtractPlainTimeStringChange(values.subtractPlainTimeString);
                        }}
                    />
                    <CalculateClear
                        disabled={(editingId !== '') || totalBaseDisabled}
                        onClickCalculate={onClickCalculateTotalDurationsSummary}
                        onClickClear={onClickClearTotalDurationsSummary}
                    />
                    {total.totalDurationsSummary.map((item) => {
                        return (
                            <TotalDurationSummary
                                key={item.id}
                                item={item}
                            />
                        );
                    })}
                </div>
                <div className={styles.detail}>
                    Detail:{detailBaseDisabled ? `(${detailBaseDisabledMessage})` : null}
                    {
                        detail.detailTimeRanges.map((item) => {
                            const currentId = `detail-${monthId}-${id}-${item.id}`;

                            return (
                                    <DetailTimeRange
                                        key={item.id}
                                        readOnly={(editingId !== currentId) || detailBaseDisabled}
                                        editDisabled={(editingId !== '') || detailBaseDisabled}
                                        {...item}
                                        onClickEdit={() => {
                                            onChangeEditingId(currentId);
                                        }}
                                        onSubmitFormValues={(values) => {
                                            onSubmitDetailTimeRangeFormValues({ id: item.id, values });
                                        }}
                                    />
                            )
                        })
                    }
                    <AddPopRange
                        disabled={(editingId !== '') || detailBaseDisabled}
                        onClickAdd={onClickAddDetailTimeRange}
                        onClickPop={onClickPopDetailTimeRange}
                    />
                    <CalculateClear
                        disabled={(editingId !== '') || detailBaseDisabled}
                        onClickCalculate={onClickCalculateDetailDurationsSummary}
                        onClickClear={onClickClearDetailDurationsSummary}
                    />
                    {detail.detailDurationsSummary.map((item) => {
                        const currentId = `detail-${monthId}-${id}-${item.id}-durationSummaryFinalHour`;

                        return (
                            <DetailDurationSummary
                                key={item.id}
                                readOnly={editingId !== currentId}
                                editDisabled={(editingId !== '') || (item.finalHourChangeable && item.finalHour.required && detailBaseDisabled)}
                                item={item}
                                onClickEdit={() => {
                                    onChangeEditingId(currentId);
                                }}
                                onSubmitFinalHourValue={(finalHourValue) => {
                                    onSubmitDetailSummaryFinalHourValue({ id: item.id, finalHourValue });
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default Day;