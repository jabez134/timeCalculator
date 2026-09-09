
import { useEffect, useState } from "react";

import styles from './index.module.css';
import { alertUtil } from "../../utils/utils";

type Props = {
    label: string;
    fileName: string;
    fileMIMEType: 'application/json' | 'text/markdown';
    onExport: () => { success: true; text: string } | { success: false; message: string };
};

function ExportDownloadFile({ label, fileName, fileMIMEType, onExport }: Props) {
    const [fileURL, setFileURL] = useState('');

    useEffect(() => {
        return () => {
            if (fileURL) {
                URL.revokeObjectURL(fileURL);
            }
        };
    }, []);
    
    return (
        <div className={styles.export_download_wrapper}>
            {label}:
            <button
                type="button"
                onClick={() => {
                    const exportResult = onExport();
                    if (!exportResult.success) {
                        alertUtil(exportResult.message);
                        return;
                    }
                    const file = new File([exportResult.text], fileName, { type: fileMIMEType });
                    const downloadURL = URL.createObjectURL(file);
                    if (fileURL) {
                        URL.revokeObjectURL(fileURL);
                    }
                    setFileURL(downloadURL);
                }}
            >
                Export
            </button>
            {fileURL ? (
                <a
                    type={fileMIMEType}
                    download={fileName}
                    href={fileURL}
                    onClick={(e) => {
                        if (!fileURL) {
                            alertUtil(`download file URL is not exist`);
                            e.preventDefault();
                        }
                    }}
                >
                    Download File
                </a>
            ): null}
        </div>
    );
}

export default ExportDownloadFile;