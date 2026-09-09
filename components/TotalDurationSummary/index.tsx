import styles from './index.module.css';

type Props = {
    item: TotalDurationsSummaryItem;
}

function TotalDurationSummary({ item }: Props) {

    return (
        <div className={styles.total_duration_summary_wrapper}>
            {item.name}: {item.durationString}
        </div>
    );
}

export default TotalDurationSummary;