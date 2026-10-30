import { alertUtil } from '../../utils/utils';

import styles from './index.module.css';

type FormValues = DetailTimeRangeFormValues;
type FormValuesKey = keyof FormValues;

type Props = DetailTimeRangeType & {
    readOnly: boolean;
    editDisabled: boolean;
    onClickEdit: React.DOMAttributes<HTMLButtonElement>['onClick'];
    onSubmitFormValues: (values: FormValues) => void;
}

function DetailTimeRange({ readOnly, editDisabled, formValues, resultText, onClickEdit, onSubmitFormValues }: Props) {
    // if input read only, can not valid data when submit form

    // if input is read only, there is input data in form data
    // if input is disabled, there is not input data in form data
    return (
        <div className={styles.detail_time_range_wrapper}>
            <form
                action={(formData) => {
                    const nextFormValues: FormValues = { projectName: "", startPlainTimeString: "", endPlainTimeString: "", currentSubtractPlainTimeString: "" };
                    const formValuesKey = Object.keys(nextFormValues) as FormValuesKey[];

                    for (const [key, value] of formData) {
                        const k = key as FormValuesKey;
                        if (!formValuesKey.includes(k)) {
                            const errorMessage = `incorrect key(${k}) of form data in DetailTimeRange`;
                            alertUtil(errorMessage);
                            return;
                        }
                        if (typeof value !== 'string') {
                            const errorMessage = `incorrect value(${value}) of form data in DetailTimeRange`;
                            alertUtil(errorMessage);
                            return;
                        }
                        nextFormValues[k] = value;
                    }

                    onSubmitFormValues(nextFormValues);
                }}
            >
                <div className={styles.form_child}>
                    <button disabled={editDisabled} type="button" onClick={onClickEdit}>Edit</button>
                    <div>
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
                    </div>
                    <input
                        required
                        readOnly={readOnly}
                        type="text"
                        size={3}
                        placeholder="project name"
                        name="projectName"
                        defaultValue={formValues.projectName}
                    />
                    <div>
                        (减 <input
                            required
                            readOnly={readOnly}
                            type="time"
                            name="currentSubtractPlainTimeString"
                            defaultValue={formValues.currentSubtractPlainTimeString}
                        />)
                    </div>
                    <button disabled={readOnly} type="submit">Submit</button>
                </div>
            </form>
            <div>{resultText}</div>
        </div>
    );
}

export default DetailTimeRange;