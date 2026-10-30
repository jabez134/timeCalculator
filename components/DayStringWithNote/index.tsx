
import styles from './index.module.css';

type Props = {
    dayString: string;
    note: string | undefined;
    onChangeNote: (changedText: string) => void;
};
function DayStringWithNote({ dayString, note, onChangeNote }: Props) {

    return (
        <div className={styles.day_text_wrapper}>
            <div>Day: {dayString}</div>
            <input
                type="text"
                size={100}
                placeholder="备注"
                value={note ?? ''}
                onChange={(e) => onChangeNote(e.target.value)}
            />
        </div>
    )
}

export default DayStringWithNote;