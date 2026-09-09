
import styles from './index.module.css';

type Props = {
    disabled: boolean;
    onClickAdd: React.DOMAttributes<HTMLButtonElement>['onClick'];
    onClickPop: React.DOMAttributes<HTMLButtonElement>['onClick'];
};

function AddPopRange({ disabled, onClickAdd, onClickPop }: Props) {
    return (
        <div className={styles.buttons_wrapper}>
            <button
                type="button"
                disabled={disabled}
                onClick={onClickAdd}
            >
                Add
            </button>
            <button
                type="button"
                disabled={disabled}
                onClick={onClickPop}
            >
                Pop
            </button>
        </div>
    )
}

export default AddPopRange;