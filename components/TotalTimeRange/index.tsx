import { alertUtil } from '../../utils/utils';

import styles from './index.module.css';

type FormValues = TotalTimeRangeFormValues;
type FormValuesKey = keyof FormValues;

type Props = TotalTimeRangeType & {
    readOnly: boolean;
    editDisabled: boolean;
    onClickEdit: React.DOMAttributes<HTMLButtonElement>['onClick'];
    onSubmitFormValues: (values: FormValues) => void;
}

function TotalTimeRange({ readOnly, editDisabled, formValues, resultText, onClickEdit, onSubmitFormValues }: Props) {
    return (
        <div className={styles.total_time_range_wrapper}>
            <form
                action={(formData) => {
                    const nextFormValues: FormValues = { startPlainTimeString: "", endPlainTimeString: "" };
                    const formValuesKey = Object.keys(nextFormValues) as FormValuesKey[];

                    for (const [key, value] of formData) {
                        const k = key as FormValuesKey;
                        if (!formValuesKey.includes(k)) {
                            const errorMessage = `incorrect key(${k}) of form data in TotalTimeRange`;
                            alertUtil(errorMessage);
                            return;
                        }
                        if (typeof value !== 'string') {
                            const errorMessage = `incorrect value(${value}) of form data in TotalTimeRange`;
                            alertUtil(errorMessage);
                            return;
                        }
                        nextFormValues[k] = value;
                    }

                    onSubmitFormValues(nextFormValues);
                }}
            >
                <button disabled={editDisabled} type="button" onClick={onClickEdit}>Edit</button>
                &nbsp;&nbsp;
                <input
                    required
                    readOnly={readOnly}
                    type="time"
                    name="startPlainTimeString"
                    defaultValue={formValues.startPlainTimeString}
                />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;~&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <input
                    required
                    readOnly={readOnly}
                    type="time"
                    name="endPlainTimeString"
                    defaultValue={formValues.endPlainTimeString}
                />
                <button className={styles.submit_button} disabled={readOnly} type="submit">Submit</button>
            </form>
            <div>{resultText}</div>
        </div>
    );
}

export default TotalTimeRange;