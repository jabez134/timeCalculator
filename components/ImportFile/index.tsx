import { alertUtil } from '../../utils/utils';

type Props = {
    label: string;
    onImport: (importData: unknown) => void;
};

function ImportFile({ label, onImport }: Props) {

    return (
        <div>
            {label}:
            <form
                action={(formData) => {
                    for (const [_key, value] of formData) {
                        if (!(value instanceof File)) {
                            alertUtil(`import value is not a file`);
                            continue;
                        }

                        const fileReader = new FileReader();
                        fileReader.onload = () => {
                            const readerResult = fileReader.result;
                            if (typeof readerResult !== 'string') {
                                return;
                            }
                            onImport(JSON.parse(readerResult));
                        }
                        fileReader.readAsText(value);
                    }
                }}
            >
                <input accept="application/json" type="file" name="file" id="file" />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default ImportFile;