
import { useState } from "react";

import { alertUtil } from "../../utils/utils";

import styles from './index.module.css';

type Props = {
    max: string;
    min: string;
    onAddDay: (params: { addedDayString: string }) => { success: true } | { success: false, message: string };
    onPopDay: React.DOMAttributes<HTMLButtonElement>['onClick'];
};

const dayStringKey = 'dayString';
function AddPopDay({ max, min, onAddDay, onPopDay }: Props) {
    const [dayString, setDayString] = useState('');
    const [disabled, setDisabled] = useState(true);

    return (
        <div className={styles.add_pop_day_wrapper}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    for (const [key, value] of formData) {
                        if (key === dayStringKey && typeof value === 'string' && value === dayString) {
                            const addResult = onAddDay({ addedDayString: value });
                            if (!addResult.success) {
                                alertUtil(addResult.message);
                                continue;
                            }
                            setDayString('');
                            setDisabled(true);
                        }
                    }
                }}
            >
                <div className={styles.form_content_wrapper}>
                    <button type="button" onClick={() => setDisabled(false)}>Enable</button>
                    <input
                        className={styles.input_date}
                        required
                        type="date"
                        disabled={disabled}
                        name={dayStringKey}
                        max={max}
                        min={min}
                        value={dayString}
                        onChange={(e) => setDayString(e.target.value)}
                    />
                    <button className={styles.add_button} disabled={disabled} type="submit">Add Day</button>
                    <button className={styles.pop_button} disabled={disabled} type="button" onClick={onPopDay}>Pop Day</button>
                </div>
            </form>
        </div>
    )
}

export default AddPopDay;