import { useEffect, useState } from 'react';
import { changeDataFromFileNameToMarkdownText } from '../../utils/dataFromPicturesUtils';
import { alertUtil } from '../../utils/utils';

import styles from './index.module.css';

type Props = {
    label: string;
    exportFileName: string;
    exportFileMIMEType: 'text/markdown';
};

function ImportPicturesForTimeRanges({ label, exportFileName, exportFileMIMEType }: Props) {
    const [fileURL, setFileURL] = useState('');
    
    useEffect(() => {
        return () => {
            if (fileURL) {
                URL.revokeObjectURL(fileURL);
            }
        };
    }, []);
    return (
        <div className={styles.import_files_wrapper}>
            {label}:
            <form
                onChange={() => {
                    if (fileURL) {
                        URL.revokeObjectURL(fileURL);
                    }
                    setFileURL('');
                }}
                action={(formData) => {
                    const files = formData.getAll('files');

                    const text = changeDataFromFileNameToMarkdownText({ files });

                    const file = new File([text], exportFileName, { type: exportFileMIMEType });
                    const downloadURL = URL.createObjectURL(file);
                    if (fileURL) {
                        URL.revokeObjectURL(fileURL);
                    }
                    setFileURL(downloadURL);
                }}
            >
                <input required multiple accept="image/*" type="file" name="files" id="files" />
                <button type="submit">Submit</button>
            </form>
            {fileURL ? (
                <a
                    type={exportFileMIMEType}
                    download={exportFileName}
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

export default ImportPicturesForTimeRanges;