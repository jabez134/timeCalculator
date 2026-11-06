import { useEffect, useState } from "react";

import Month from "../Month";
import AddMonth from "../AddMonth";
import ImportFile from "../ImportFile";
import ImportPicturesForTimeRanges from "../ImportPicturesForTimeRanges";
import ExportDownloadFile from "../ExportDownloadFile";

import { alertUtil, getInitialMonth } from "../../utils/utils";
import { changeDetailToMarkdownText } from "../../utils/detailDataUtils";
import { changeTotalToMarkdownText, changeTotalToMarkdownTextForCompareWithPhotos } from "../../utils/totalDataUtils";
import { MONTHS_LOCAL_STORAGE_KEY } from "../../utils/constants";

import styles from './index.module.css';


const monthsInLocalStorage = window.localStorage.getItem(MONTHS_LOCAL_STORAGE_KEY);
const monthsOuter = monthsInLocalStorage ? window.JSON.parse(monthsInLocalStorage) : [];

function Months() {
    const [editingId, setEditingId] = useState('');
    const [months, setMonths] = useState<MonthType[]>(monthsOuter);

    const [exportDownloadFilesKey, setExportDownloadFilesKey] = useState(0);

    useEffect(() => {

        // clear fileURL when months changed
        setExportDownloadFilesKey((key) => key + 1);

        const monthsString = JSON.stringify(months);
        localStorage.setItem(MONTHS_LOCAL_STORAGE_KEY, monthsString);
    }, [months]);

    const monthsString = months.map(m => m.monthString).join('_');
    
    const exportTimeRangesTotalPicturesFileName = `time_ranges_total_pictures_${monthsString}.md`;
    return (
        <div className={styles.months_wrapper}>
            <ImportPicturesForTimeRanges
                label="Import Pictures"
                exportFileName={exportTimeRangesTotalPicturesFileName}
                exportFileMIMEType="text/markdown"
            />
            {months.length === 0 ? (
                <ImportFile
                    label="Import JSON Data"
                    onImport={(importData) => {
                        if (importData === null) {
                            return;
                        }
                        if (typeof importData !== 'object') {
                            return;
                        }
                        if (!('months' in importData)) {
                            return;
                        }

                        if (!(importData.months instanceof Array)) {
                            return;
                        }

                        setMonths(importData.months);
                    }}
                />
            ) : null}
            {months.map((m) => {
                return (
                    <Month
                        key={m.id}
                        monthId={m.id}
                        editingId={editingId}
                        monthString={m.monthString}
                        days={m.days}
                        onChangeEditingId={setEditingId}
                        onChangeMonths={setMonths}
                    />
                )
            })}
            {months.length === 0 ? (
                <AddMonth
                    onAddMonth={({ addedMonthString }) => {
                        setEditingId('');
                        setMonths((monthsPrevious) => {
                            const monthExist = monthsPrevious.some((i) => i.monthString === addedMonthString);
                            if (monthExist) {
                                alertUtil(`${addedMonthString} already exist`);
                                return monthsPrevious;
                            }

                            return [ ...monthsPrevious, getInitialMonth({ previousArrayLength: monthsPrevious.length, monthString: addedMonthString })]
                        });
                    }}
                />
            ): null}
            
            <div key={exportDownloadFilesKey} className={styles.exports_download_wrapper}>
                <div>
                    <ExportDownloadFile
                        label="Total(Markdown)"
                        fileName={`time_ranges_total_${monthsString}.md`}
                        fileMIMEType="text/markdown"
                        onExport={() => {
                            if (months.length === 0) {
                                return { success: false, message: `month data is not exist` };
                            }
                            return { success: true, text: changeTotalToMarkdownText({ months }) };
                        }}
                    
                    />
                    <ExportDownloadFile
                        label="Total(Markdown, for compare with pictures)"
                        fileName={exportTimeRangesTotalPicturesFileName}
                        fileMIMEType="text/markdown"
                        onExport={() => {
                            if (months.length === 0) {
                                return { success: false, message: `month data is not exist` };
                            }
                            return { success: true, text: changeTotalToMarkdownTextForCompareWithPhotos({ months }) };
                        }}
                    />
                </div>
                <ExportDownloadFile
                    label="Detail(Markdown)"
                    fileName={`time_ranges_detail_${monthsString}.md`}
                    fileMIMEType="text/markdown"
                    onExport={() => {
                        if (months.length === 0) {
                            return { success: false, message: `month data is not exist` };
                        }
                        return { success: true, text: changeDetailToMarkdownText({ months }) };
                    }}
                />
                <ExportDownloadFile
                    label="All Data(JSON)"
                    fileName={`data_${monthsString}.json`}
                    fileMIMEType="application/json"
                    onExport={() => {
                        if (months.length === 0) {
                            return { success: false, message: `month data is not exist` };
                        }
                        return { success: true, text: JSON.stringify({ months }) };
                    }}
                />
            </div>
        </div>
    )
}

export default Months;