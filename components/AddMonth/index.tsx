
import { useState } from "react";

import styles from './index.module.css';

type Props = {
    onAddMonth: (params: { addedMonthString: string }) => void;
};

const monthStringKey = 'monthString';
function AddMonth({ onAddMonth }: Props) {
    const [disabled, setDisabled] = useState(true);
    return (
        <div className={styles.add_month_wrapper}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    for (const [key, value] of formData) {
                        if (key === monthStringKey && typeof value === 'string') {
                            onAddMonth({ addedMonthString: value });
                            setDisabled(true);
                        }
                    }
                }}
            >
                <button type="button" onClick={() => setDisabled(false)}>Enable</button>
                <input
                    className={styles.input_month}
                    disabled={disabled}
                    required
                    type="month"
                    size={8}
                    name={monthStringKey}
                />
                <button className={styles.add_button} disabled={disabled} type="submit">Add Month</button>
            </form>
        </div>
    )
}

export default AddMonth;