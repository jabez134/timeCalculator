import { alertUtil } from '../../utils/utils';

import styles from './index.module.css';

type FormValues = { subtractPlainTimeString: string };
type FormValuesKey = keyof FormValues;

type Props = {
    readOnly: boolean;
    editDisabled: boolean;
    formValues: FormValues;
    onClickEdit: React.DOMAttributes<HTMLButtonElement>['onClick'];
    onSubmitFormValues: (values: FormValues) => void;
}

function TotalTimeSubtract({ readOnly, editDisabled, formValues, onClickEdit, onSubmitFormValues }: Props) {
    return (
        <div className={styles.total_time_subtract_wrapper}>
            <form
                action={(formData) => {
                    const nextFormValues: FormValues = { subtractPlainTimeString: "" };
                    const formValuesKey = Object.keys(nextFormValues) as FormValuesKey[];

                    for (const [key, value] of formData) {
                        const k = key as FormValuesKey;
                        if (!formValuesKey.includes(k)) {
                            const errorMessage = `incorrect key(${k}) of form data in TotalTimeSubtract`;
                            alertUtil(errorMessage);
                            return;
                        }
                        if (typeof value !== 'string') {
                            const errorMessage = `incorrect value(${value}) of form data in TotalTimeSubtract`;
                            alertUtil(errorMessage);
                            return;
                        }
                        nextFormValues[k] = value;
                    }
                    onSubmitFormValues(nextFormValues);
                    
                }}
            >
                <button disabled={editDisabled} type="button" onClick={onClickEdit}>Edit</button>
                减 <input
                    required
                    readOnly={readOnly}
                    type="time"
                    name="subtractPlainTimeString"
                    defaultValue={formValues.subtractPlainTimeString}
                />
                <button className={styles.submit_button} disabled={readOnly} type="submit">Submit</button>
            </form>
        </div>
    );
}

export default TotalTimeSubtract;