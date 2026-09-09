
import styles from './index.module.css';

type Props = {
    disabled: boolean;
    onClickCalculate: React.DOMAttributes<HTMLButtonElement>['onClick'];
    onClickClear: React.DOMAttributes<HTMLButtonElement>['onClick'];
};

function CalculateClear({ disabled, onClickCalculate, onClickClear }: Props) {
    return (
        <div className={styles.button_wrapper}>
            <button
                type="button"
                disabled={disabled}
                onClick={onClickCalculate}
            >
                Calculate Summary
            </button>
            <button
                type="button"
                disabled={disabled}
                onClick={onClickClear}
            >
                Clear Summary
            </button>
        </div>
    );
}

export default CalculateClear;