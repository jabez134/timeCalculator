import { alertUtil } from '../../utils/utils';

import styles from './index.module.css';

type FormValues = { finalHourValue: FinalHourType['value'] };
type FormValuesKey = keyof FormValues;

type Props = {
    readOnly: boolean;
    editDisabled: boolean;
    item: DetailDurationsSummaryItem;

    onClickEdit: React.DOMAttributes<HTMLButtonElement>['onClick'];
    onSubmitFinalHourValue: (finalHourValue: FinalHourType['value']) => void;
}

function DetailDurationSummary({ readOnly, editDisabled, item, onClickEdit, onSubmitFinalHourValue }: Props) {

    return (
        <div className={styles.detail_duration_summary_wrapper}>
            {item.name}: {item.durationString}
            {item.finalHourChangeable ? (
                <form action={(formData) => {
                    const nextFormValues: FormValues = { finalHourValue: '' };

                    const formValuesKey = Object.keys(nextFormValues) as FormValuesKey[];

                    for (const [key, value] of formData) {

                        const k = key as FormValuesKey;
                        if (!formValuesKey.includes(k)) {
                            const errorMessage = `incorrect key(${k}) of form data in detail duration summary`;
                            alertUtil(errorMessage);
                            return;
                        }

                        if (typeof value !== 'string') {
                            const errorMessage = `incorrect value(${value}) of form data in detail duration summary`;
                            alertUtil(errorMessage);
                            return;
                        }

                        nextFormValues[k] = value;
                    }

                    onSubmitFinalHourValue(nextFormValues.finalHourValue);
                }}>
                    <div className={styles.detail_duration_final_hour_wrapper}>
                        <button disabled={editDisabled} type="button" onClick={onClickEdit}>Edit</button>
                        <input
                            required={item.finalHour.required}
                            readOnly={readOnly}
                            type="number"
                            name="finalHourValue"
                            defaultValue={item.finalHour.value}
                            max={item.finalHour.max}
                            min={item.finalHour.min}
                            step={0.1}
                        />
                        <span>Final Hour: {item.finalHour.value}</span>
                        <button disabled={readOnly} type="submit">Submit</button>
                    </div>
                </form>
            ) : null}
            
        </div>
    );
}

export default DetailDurationSummary;