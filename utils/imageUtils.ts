// Exif Version 2.2: https://exiv2.org/Exif2-2.PDF
// TIFF: https://www.itu.int/itudoc/itu-t/com16/tiff-fx/docs/tiff6.pdf

const LITTLE_ENDIAN_BYTE_ORDER_IN_TIFF = 'II';
const BIG_ENDIAN_BYTE_ORDER_IN_TIFF = 'MM';

const TIFF_IDENTITY = 42;

const DATE_TIME_KEY = 'dateTime';
const DATE_TIME_ORIGINAL_KEY = 'dateTimeOriginal';
const DATE_TIME_DIGITIZED_KEY = 'dateTimeDigitized';
const SUB_SEC_TIME_KEY = 'subSecTime';
const SUB_SEC_TIME_ORIGINAL_KEY = 'subSecTimeOriginal';
const SUB_SEC_TIME_DIGITIZED_KEY = 'subSecTimeDigitized';
export const EXIF_KEY = 'ExifIFDPointer';
const GPS_KEY = 'GPSInfoIFDPointer';
const INTEROPERABILITY_IFD_POINTER = 'interoperabilityIFDPointer';
const pointerKeys = [EXIF_KEY, GPS_KEY, INTEROPERABILITY_IFD_POINTER];

// Conformance to this standard is indicated by recording "0220" as 4-byte ASCII. Since the type is UNDEFINED, there is no NULL for termination.
const EXIF_VERSION_KEY = 'exifVersion';
const FLASHPIX_VERSION_KEY = 'flashpixVersion';
const asciiUndefinedFieldTagKeys = [EXIF_VERSION_KEY, FLASHPIX_VERSION_KEY];

type FieldType = 'BYTE' | 'ASCII' | 'SHORT' | 'LONG' | 'RATIONAL' | 'SBYTE' | 'UNDEFINED' | 'SSHORT' | 'SLONG' | 'SRATIONAL' | 'FLOAT' | 'DOUBLE';

type FieldTagMapValue = {
    key: string;
    name?: string;
    allowedTypes: FieldType[];
    allowedCount?: 'ANY' | number[];
    allowedBytes?: number;
};
const mapFieldTag = new Map<number, FieldTagMapValue>(
    [
        [0x0100, { key: 'imageWidth', name: 'Image width', allowedTypes: ['SHORT', 'LONG'] }],
        [0x0101, { key: 'imageLength', name: 'Image height', allowedTypes: ['SHORT', 'LONG'] }],
        [0x010F, { key: 'make', name: 'Image input equipment manufacturer', allowedTypes: ['ASCII'] }],
        [0x0110, { key: 'model', name: 'Image input equipment model', allowedTypes: ['ASCII'] }],
        [0x0112, { key: 'orientation', name: 'Orientation of image', allowedTypes: ['SHORT'] }],
        [0x011A, { key: 'xResolution', name: 'Image resolution in width direction', allowedTypes: ['RATIONAL'], allowedBytes: 8 }],
        [0x011B, { key: 'yResolution', name: 'Image resolution in height direction',  allowedTypes: ['RATIONAL'], allowedBytes: 8 }],
        [0x0128, { key: 'resolutionUnit', name: 'Unit of X and Y resolution', allowedTypes: ['SHORT'] }],
        [0x0132, { key: DATE_TIME_KEY, name: 'File change date and time', allowedTypes: ['ASCII'], allowedBytes: 20 }],
        [0x0213, { key: 'YCbCrPositioning', name: 'Y and C positioning', allowedTypes: ['SHORT'] }],
        [0x8769, { key: EXIF_KEY, name: 'Exif tag', allowedTypes: ['LONG'], allowedCount: [1] }],
        [0x8825, { key: GPS_KEY, name: 'GPS tag', allowedTypes: ['LONG'], allowedCount: [1] }],

        // Exif Private Tags
        [0x829A, { key: 'exposureTime', name: 'Exposure time', allowedTypes: ['RATIONAL'], allowedCount: [1] }],
        [0x829D, { key: 'fNumber', name: 'F number', allowedTypes: ['RATIONAL'], allowedCount: [1] }],
        
        // count: 4
        [0x8822, { key: 'exposureProgram', name: 'Exposure program', allowedTypes: ['SHORT'], allowedCount: [1] }],
        [0x8827, { key: 'isoSpeedRatings', name: 'ISO speed rating', allowedTypes: ['SHORT'], allowedCount: 'ANY' }],
        [0x8895, { key: '0x8895', name: '0x8895', allowedTypes: ['SHORT'], allowedCount: [1] }], // TODO
        [0x889A, { key: '0x889A', name: '0x889A', allowedTypes: ['BYTE'], allowedCount: [1] }], // TODO

        // count: 4
        [0x9000, { key: EXIF_VERSION_KEY, name: 'Exif Version', allowedTypes: ['UNDEFINED'], allowedCount: [4] }],
        [0x9003, { key: DATE_TIME_ORIGINAL_KEY, name: 'Date and time original image was generated', allowedTypes: ['ASCII'], allowedCount: [20] }], // TODO: if little endian?
        [0x9004, { key: DATE_TIME_DIGITIZED_KEY, name: 'Date and time image was made digital data', allowedTypes: ['ASCII'], allowedCount: [20] }],
        [0x9101, { key: 'componentsConfiguration', name: 'Meaning of each component', allowedTypes: ['UNDEFINED'], allowedCount: [4] }],


        // count: 12
        [0x9201, { key: 'shutterSpeedValue', name: 'Shutter speed', allowedTypes: ['SRATIONAL'], allowedCount: [1] }],
        [0x9202, { key: 'apertureValue', name: 'Aperture', allowedTypes: ['RATIONAL'], allowedCount: [1] }],
        [0x9203, { key: 'brightnessValue', name: 'Brightness', allowedTypes: ['SRATIONAL'], allowedCount: [1] }],
        [0x9204, { key: 'exposureBiasValue', name: 'Exposure bias', allowedTypes: ['SRATIONAL'], allowedCount: [1] }],
        [0x9205, { key: 'maxApertureValue', name: 'Maximum lens aperture', allowedTypes: ['RATIONAL'], allowedCount: [1] }],
        [0x9207, { key: 'meteringMode', name: 'Metering mode', allowedTypes: ['SHORT'], allowedCount: [1] }],
        [0x9208, { key: 'lightSource', name: 'Light source', allowedTypes: ['SHORT'], allowedCount: [1] }],
        [0x9209, { key: 'flash', name: 'Flash', allowedTypes: ['SHORT'], allowedCount: [1] }],
        [0x920A, { key: 'FocalLength', name: 'Lens focal length', allowedTypes: ['RATIONAL'], allowedCount: [1] }],
        [0x9290, { key: SUB_SEC_TIME_KEY, name: 'DateTime subseconds', allowedTypes: ['ASCII'], allowedCount: 'ANY' }],
        [0x9291, { key: SUB_SEC_TIME_ORIGINAL_KEY, name: 'DateTimeOriginal subseconds', allowedTypes: ['ASCII'], allowedCount: 'ANY' }],
        [0x9292, { key: SUB_SEC_TIME_DIGITIZED_KEY, name: 'DateTimeDigitized subseconds', allowedTypes: ['ASCII'], allowedCount: 'ANY' }],

        // count: 2
        [0x9999, { key: 'xiaomiSettings', name: 'Xiaomi settings', allowedTypes: ['ASCII'] }],
        [0x9AAA, { key: '0x9AAA', name: '0x9AAA', allowedTypes: ['BYTE'] }], // TODO

        // cout: 12
        [0xA000, { key: FLASHPIX_VERSION_KEY, name: 'Supported Flashpix version', allowedTypes: ['UNDEFINED'], allowedCount: [4] }],
        [0xA001, { key: 'colorSpace', name: 'Color space information', allowedTypes: ['SHORT'], allowedCount: [1] }],
        [0xA002, { key: 'pixelXDimension', name: 'Valid image width', allowedTypes: ['SHORT', 'LONG'], allowedCount: [1] }],
        [0xA003, { key: 'pixelYDimension', name: 'Valid image height', allowedTypes: ['SHORT', 'LONG'], allowedCount: [1] }],
        [0xA005, { key: INTEROPERABILITY_IFD_POINTER, name: 'Interoperability tag', allowedTypes: ['LONG'], allowedCount: [1] }],
        [0xA217, { key: 'sensingMethod', name: 'Sensing method', allowedTypes: ['SHORT'], allowedCount: [1] }],
        [0xA301, { key: 'sceneType', name: 'Scene type', allowedTypes: ['UNDEFINED'], allowedCount: [1] }],
        [0xA402, { key: 'exposureMode', name: 'Exposure mode', allowedTypes: ['SHORT'], allowedCount: [1] }],
        [0xA403, { key: 'whiteBalance', name: 'White balance', allowedTypes: ['SHORT'], allowedCount: [1] }],
        [0xA405, { key: 'focalLengthIn35mmFilm', name: 'Focal length in 35 mm film', allowedTypes: ['SHORT'], allowedCount: [1] }],
        [0xA406, { key: 'sceneCaptureType', name: 'Scene capture type', allowedTypes: ['SHORT'], allowedCount: [1] }],
        [0xA661, { key: '0xA661', name: '0xA661', allowedTypes: ['ASCII'], allowedCount: [4] }], // TODO

        // Interoperability Tag
        [0x0001, { key: 'interoperabilityIndex', name: 'Interoperability Identification', allowedTypes: ['ASCII'] }],
        [0x0002, { key: '0x0002', name: '0x0002', allowedTypes: ['UNDEFINED'] }],
    ]
);
/**
 * The field types and their sizes are:
 * 1 = BYTE: 8-bit unsigned integer.
 * 2 = ASCII: 8-bit byte that cotains a 7-bit ASCII code; the last byte must be NUL(binary zero).
 * 3 = SHORT: 16-bit(2-byte) unsigned integer.
 * 4 = LONG: 32-bit(4-byte) unsigned integer.
 * 5 = RATIONAL: Two LONGs: the first represents the numerator of a fraction; the second, the denominator.
 * 6 = SBYTE: An 8 bit signed (twos-complement) integer.
 * 7 = UNDEFINED: An 8-bit byte that may contain anything, depending on the definition of the field.
 * 8 = SSHORT: A 16-bit (2-byte) signed (twos-complement) integer.
 * 9 = SLONG: A 32-bit (4-byte) signed (twos-complement) integer.
 * 10 = SRATIONAL: Two SLONGs: the first represents the numerator of a fraction; the second, the denominator.
 * 11 = FLOAT: Single precision (4-byte) IEEE format.
 * 12 = DOUBLE: Double precision (8-byte) IEEE format.
 */
type FieldTypeMapValue = {
    text: FieldType;
    bytes: number;
};
const mapFieldType = new Map<number, FieldTypeMapValue>(
    [
        [0x0001, { text: 'BYTE', bytes: 1 }],
        [0x0002, { text: 'ASCII', bytes: 1 }],
        [0x0003, { text: 'SHORT', bytes: 2 }],
        [0x0004, { text: 'LONG', bytes: 4 }],
        [0x0005, { text: 'RATIONAL', bytes: 8 }],
        [0x0006, { text: 'SBYTE', bytes: 1 }],
        [0x0007, { text: 'UNDEFINED', bytes: 1 }],
        [0x0008, { text: 'SSHORT', bytes: 2 }],
        [0x0009, { text: 'SLONG', bytes: 4 }],
        [0x000a, { text: 'SRATIONAL', bytes: 8 }],
        [0x000b, { text: 'FLOAT', bytes: 4 }],
        [0x000c, { text: 'DOUBLE', bytes: 8 }],
    ]
);

type GetBytesFromDataViewParams = {
    dataView: DataView<ArrayBuffer>;
    littleEndian: boolean;
    byteOffset: number;
    byteLength: number;
};
const getBytesFromDataView = ({ dataView, byteOffset, byteLength, littleEndian }: GetBytesFromDataViewParams) => {
    const arr = new Array(byteLength).fill(0).map((_item, index) => {
        const byte = dataView.getUint8(byteOffset + index);
        return { byteHex: byte.toString(16), byte };
    });
    
    return { bytes: arr };
}

type GetStringFromDataViewParams = {
    dataView: DataView<ArrayBuffer>;
    littleEndian: boolean;
    byteOffset: number;
    byteLength: number;
};
const getStringFromDataView = ({ dataView, byteOffset, byteLength, littleEndian }: GetStringFromDataViewParams) => {
    const arr = new Array(byteLength).fill(0).map((_item, index) => {
        const byte = dataView.getUint8(byteOffset + index);
        const byteChar = String.fromCharCode(byte);
        return { char: byteChar, byteHex: byte.toString(16), byte };
    });
    
    return { str: arr.map(i => i.char).join(''), charBytes: arr };
}


type FunctionValidateFailedReturn = {
    success: false;
    message: string;
};


type GetImageFileDirectoryEntryFromDataViewBaseReturn = {
    fieldTagKey: string;
    fieldTagName?: string | undefined;
    fieldType: FieldType;
    fieldValueCount: number;
    fieldValueOffset: number;
}
type GetImageFileDirectoryEntryFromDataViewPointerReturn = GetImageFileDirectoryEntryFromDataViewBaseReturn & {
    success: true;
    returnType: 'POINTER';
    child: ReturnType<typeof getImageFileDirectoryFromDataView>;
};
type GetImageFileDirectoryEntryFromDataViewASCIIReturn = GetImageFileDirectoryEntryFromDataViewBaseReturn & {
    success: true;
    returnType: 'ASCII'; // ASCII and asciiUndefinedFieldTagKeys
    fieldValue: ReturnType<typeof getStringFromDataView>;
}
type GetImageFileDirectoryEntryFromDataViewNumberReturn = GetImageFileDirectoryEntryFromDataViewBaseReturn & {
    success: true;
    returnType: 'NUMBER';
    fieldValue: number;
}
type GetImageFileDirectoryEntryFromDataViewRationalReturn = GetImageFileDirectoryEntryFromDataViewBaseReturn & {
    success: true;
    returnType: 'RATIONAL' | 'SRATIONAL';
    fieldValue: { numeratorOfFraction: number; denominatorOfFraction: number; };
}
type GetImageFileDirectoryEntryFromDataViewBytesReturn = GetImageFileDirectoryEntryFromDataViewBaseReturn & {
    success: true;
    returnType: 'BYTES';
    fieldValue: ReturnType<typeof getBytesFromDataView>;
}
type GetImageFileDirectoryEntryFromDataViewReturn =
    FunctionValidateFailedReturn
    | GetImageFileDirectoryEntryFromDataViewPointerReturn
    | GetImageFileDirectoryEntryFromDataViewASCIIReturn
    | GetImageFileDirectoryEntryFromDataViewNumberReturn
    | GetImageFileDirectoryEntryFromDataViewRationalReturn
    | GetImageFileDirectoryEntryFromDataViewBytesReturn;
type GetImageFileDirectoryEntryFromDataViewParams = {
    dataView: DataView<ArrayBuffer>;
    littleEndian: boolean;
    byteOffset: number;
};
const getImageFileDirectoryEntryFromDataView = ({ dataView, byteOffset, littleEndian }: GetImageFileDirectoryEntryFromDataViewParams): GetImageFileDirectoryEntryFromDataViewReturn => {
    /**
     * IFD Entry(12-byte) format:
     *  Bytes 0-1: The Tag that identifies the field.
     *  Bytes 2-3: The field Type.
     *  Bytes 4-7: The number of values, Count of the indicated Type.
     *  Bytes 8-11: The Value Offset, the file offset(in bytes) of the Value for the field.
     *      
     */
    /**
     * IFD Terminology
     *  Value/Offset
     *      To save time and space the Value Offset contains the Value instead of pointing to the Value if and only if the Value fits into 4 bytes.
     *      If the Value is shorter than 4 bytes, it if left-justified within the 4-byte Value Offset, i.e., stored in the lower-numbered bytes.
     *      Whether the Value fits within 4 bytes is determined by the Type and Count of the field.
     */
    const fieldTag = dataView.getUint16(byteOffset, littleEndian);
    const fieldType = dataView.getUint16(byteOffset + 2, littleEndian);
    const countOfValues = dataView.getUint32(byteOffset + 2 + 2, littleEndian);
    const valueOffset = dataView.getUint32(byteOffset + 2 + 2 + 4, littleEndian);

    const fieldTagMap = mapFieldTag.get(fieldTag);
    const fieldTypeMap = mapFieldType.get(fieldType);
    
    if (!fieldTagMap) {
        return { success: false, message: `field tag(0x${fieldTag.toString(16)}) is not mapped` };
    }
    if (!fieldTypeMap) {
        return { success: false, message: `field type(0x${fieldType.toString(16)}) is not mapped` };
    }

    

    const fieldTagKey = fieldTagMap.key;
    const fieldTypeString = fieldTypeMap.text;
    const bytesOfValue = fieldTypeMap.bytes * countOfValues;
    
    const baseReturn: GetImageFileDirectoryEntryFromDataViewBaseReturn = {
        fieldTagKey,
        fieldTagName: fieldTagMap.name,
        fieldType: fieldTypeString,
        fieldValueCount: countOfValues,
        fieldValueOffset: valueOffset,
    };


    // validate type
    const fieldAllowedTypes = fieldTagMap.allowedTypes;
    const typeValidateSuccess = fieldAllowedTypes.includes(fieldTypeString);
    if (!typeValidateSuccess) {
        const message = `type(${fieldTypeString}) validate failed(allowed type(s): ${fieldAllowedTypes.join(', ')})`;
        return { ...baseReturn, success: typeValidateSuccess, message };
    }

    // validate count
    const fieldAllowedCount = fieldTagMap.allowedCount;
    const countValidateSuccess = (fieldAllowedCount === undefined) || (fieldAllowedCount === 'ANY') || (fieldAllowedCount.includes(countOfValues));
    if (!countValidateSuccess) {
        const message = `value count(${countOfValues}) validate failed(allowed count: ${fieldAllowedCount})`;
        return { ...baseReturn, success: countValidateSuccess, message };
    }

    
    // validate bytes
    const fieldAllowedBytes = fieldTagMap.allowedBytes;
    const bytesValidateSuccess = (fieldAllowedBytes === undefined) || (fieldAllowedBytes === bytesOfValue);
    if (!bytesValidateSuccess) {
        const message = `value bytes(${bytesOfValue}) validate failed(allowed bytes: ${fieldAllowedBytes})`;
        return { ...baseReturn, success: bytesValidateSuccess, message };
    }

    if (pointerKeys.includes(fieldTagKey)) {
        const result = getImageFileDirectoryFromDataView({ dataView, byteOffset: valueOffset, littleEndian });
        return { ...baseReturn, success: true, returnType: 'POINTER', child: result };
    }

    const isASCII = (fieldTypeString === 'ASCII') || ((fieldTypeString === 'UNDEFINED') && ((asciiUndefinedFieldTagKeys.includes(fieldTagKey)) && (bytesOfValue === 4)));
    if (isASCII) {
        const value = getStringFromDataView({ dataView, byteOffset: bytesOfValue <= 4 ? byteOffset + 2 + 2 + 4 : valueOffset, byteLength: bytesOfValue, littleEndian });
        return { ...baseReturn, success: true, returnType: 'ASCII', fieldValue: value };
    }

    if (bytesOfValue < 4) {
        // TODO: if there is signed
        const rightShiftBits = ( 4 - bytesOfValue) * 8;
        const value = valueOffset >>> rightShiftBits;
        return { ...baseReturn, success: true, returnType: 'NUMBER', fieldValue: value };
    }

    if (bytesOfValue === 4) {
        return { ...baseReturn, success: true, returnType: 'NUMBER', fieldValue: valueOffset };
    }

    // bytes = n * (4 + 4).
    if ((fieldTypeString === 'RATIONAL') && (bytesOfValue === 8)) {
        const numeratorOfFraction = dataView.getUint32(valueOffset, littleEndian);
        const denominatorOfFraction = dataView.getUint32(valueOffset + 4, littleEndian);
        return { ...baseReturn, success: true, returnType: fieldTypeString, fieldValue: { numeratorOfFraction, denominatorOfFraction } };
    }
    if ((fieldTypeString === 'SRATIONAL') && (bytesOfValue === 8)) {
        const numeratorOfFraction = dataView.getInt32(valueOffset, littleEndian);
        const denominatorOfFraction = dataView.getInt32(valueOffset + 4, littleEndian);
        return { ...baseReturn, success: true, returnType: fieldTypeString, fieldValue: { numeratorOfFraction, denominatorOfFraction } };
    }
    
    const value = getBytesFromDataView({ dataView, byteOffset: valueOffset, byteLength: bytesOfValue, littleEndian });
    
    return { ...baseReturn, success: true, returnType: 'BYTES', fieldValue: value };
}
export type ImageFileDirectoryEntry = ReturnType<typeof getImageFileDirectoryEntryFromDataView>;

type GetImageFileDirectoryFromDataViewParams = {
    dataView: DataView<ArrayBuffer>;
    littleEndian: boolean;
    byteOffset: number;
};
type GetImageFileDirectoryFromDataViewReturn = {
    directoryEntries: ReturnType<typeof getImageFileDirectoryEntryFromDataView>[];
    nextImageFileDirectory: GetImageFileDirectoryFromDataViewReturn | undefined;
};
type GetImageFileDirectoryFromDataView = (params: GetImageFileDirectoryFromDataViewParams) => GetImageFileDirectoryFromDataViewReturn;
const getImageFileDirectoryFromDataView: GetImageFileDirectoryFromDataView = ({ dataView, byteOffset, littleEndian }) => {
    /**
     * Image File Directory:
     *  2-byte(count of the number of directory entries(i.e., the number of fields))
     *  a sequence of 12-byte field entries
     *  4-byte offset of the next IFD(or 0 if none)
     */
    const countOfNumberofDirectoryEntries = dataView.getUint16(byteOffset, littleEndian);

    const directoryEntries = new Array(countOfNumberofDirectoryEntries).fill(0).map((_item, index) => {
        const imageFileDirectoryEntry = getImageFileDirectoryEntryFromDataView({ dataView, byteOffset: byteOffset + 2 + (index * 12), littleEndian });
        return imageFileDirectoryEntry;
    });

    const nextIFDOffset = dataView.getUint32(byteOffset + 2 + (countOfNumberofDirectoryEntries * 12));
    const nextImageFileDirectory = (nextIFDOffset !== 0) ? getImageFileDirectoryFromDataView({ dataView, byteOffset, littleEndian }) : undefined;

    return { directoryEntries, nextImageFileDirectory };
}

type GetASCIIFromDirectoryEntriesParams = {
    directoryEntries: ImageFileDirectoryEntry[] | undefined;
    fieldTagKey: string;
}
type GetASCIIFromDirectoryEntriesReturn = FunctionValidateFailedReturn | {
    success: true;
    name: string | undefined;
    value: string;
}
const getASCIIFromDirectoryEntries = ({ directoryEntries, fieldTagKey }: GetASCIIFromDirectoryEntriesParams): GetASCIIFromDirectoryEntriesReturn => {
    const ALLOWED_TYPE = 'ASCII';
    const directoryEntry = directoryEntries?.find(i => i.success && i.fieldTagKey === fieldTagKey);
    if (!directoryEntry) {
        return { success: false, message: `directoryEntry(fieldTagKey: ${fieldTagKey}) is not exist` };
    }
    if (!directoryEntry.success) {
        return directoryEntry;
    }

    const fieldType = directoryEntry.fieldType;
    const returnType = directoryEntry.returnType;
    const typeValidateSuccess = (fieldType === ALLOWED_TYPE) && (returnType === ALLOWED_TYPE);
    if (!typeValidateSuccess) {
        return { success: false, message: `fieldType(${fieldType}) and returnType(${returnType}) of directoryEntry is not ${ALLOWED_TYPE}` };
    }
    return { success: true, name: directoryEntry.fieldTagName, value: directoryEntry.fieldValue.str };
}

const getPointerFromDirectoryEntries = ({ directoryEntries, fieldTagKey }: GetASCIIFromDirectoryEntriesParams) => {
    const directoryEntry = directoryEntries?.find(i => i.success && i.fieldTagKey === fieldTagKey);
    return ((directoryEntry?.success) && (directoryEntry.fieldType === 'LONG') && (directoryEntry.returnType === 'POINTER')) ? directoryEntry : undefined;
}
type GetJPEGDataFromArrayBufferReturn = FunctionValidateFailedReturn | {
    success: true;
    data: Record<'dateTime' | 'dateTimeOriginal' | 'dateTimeDigitized' | 'subSecTime' | 'subSecTimeOriginal' | 'subSecTimeDigitized', ReturnType<typeof getASCIIFromDirectoryEntries>>;
};
export const getJPEGDataFromArrayBuffer = ({ fileArrayBuffer }: { fileArrayBuffer: ArrayBuffer }): GetJPEGDataFromArrayBufferReturn => {    
    const fileDataView = new DataView(fileArrayBuffer);

    const jpegValidate = fileDataView.getUint16(0) === 0xFFD8;
    if (!jpegValidate) {
        return { success: false, message: 'The standard of file is not jpeg' };
    }

    const exifValidate = (() => {
        if (fileDataView.getUint16(2) !== 0xFFE1) {
            return false;
        }

        const { str } = getStringFromDataView({ dataView: fileDataView, byteOffset: 6, byteLength: 6, littleEndian: false });
        return str === 'Exif\x00\x00';
    })();

    if (!exifValidate) {
        return { success: false, message: 'The standard of file is not exif' };
    }

    const exifByteLength = fileDataView.getUint16(2 + 2);

    // nextAPP1
    /* const nextApp1Length = fileDataView.getUint16(2 + 2 + exifByteLength + 2);
    const nextApp1DataView = new DataView(fileDataView.buffer, 2 + 2 + exifByteLength + 2, nextApp1Length);
    getStringFromDataView({ dataView: nextApp1DataView, byteOffset: 2, byteLength: nextApp1Length - 2, littleEndian: false }); */
    
    // TIFF
    const tiffDataView = new DataView(fileDataView.buffer, 2 + 2 + 2 + 6, exifByteLength - 6 - 2);
    /**
     * Image File Header(8-byte):
     *  Bytes 0-1: The byte order used within the file. Legal values are: "II"(4949.H) / "MM"(4D4D.H)
     *  Bytes 2-3: number(42) that further identifies the file as a TIFF file.
     *  Bytes 4-7: The offset(in bytes) of the first IFD.
     */
    // byte order
    const byteOrderResult = getStringFromDataView({ dataView: tiffDataView, byteOffset: 0, byteLength: 2, littleEndian: false });
    const littleEndianByteOrder = byteOrderResult.str === LITTLE_ENDIAN_BYTE_ORDER_IN_TIFF;
    const bigEndianByteOrder = byteOrderResult.str === BIG_ENDIAN_BYTE_ORDER_IN_TIFF;
    if ((!littleEndianByteOrder) && (!bigEndianByteOrder)) {
        const message = `incorrect byte order(0x${byteOrderResult.charBytes.map(i => i.byteHex).join('')}) of tiff`;
        return { success: false, message };
    }

    // number(42) that further identifies the file as a TIFF file.
    const tiffIdentity = tiffDataView.getUint16(2, littleEndianByteOrder);
    if (tiffIdentity !== TIFF_IDENTITY) {
        return { success: false, message: 'The standard of file is not tiff' };
    }

    const firstIFDOffset = tiffDataView.getUint32(4, littleEndianByteOrder);
    
    const data = getImageFileDirectoryFromDataView({ dataView: tiffDataView, byteOffset: firstIFDOffset, littleEndian: littleEndianByteOrder });

    const dateTime = getASCIIFromDirectoryEntries({ directoryEntries: data.directoryEntries, fieldTagKey: DATE_TIME_KEY });

    const exifDirectoryEntry = getPointerFromDirectoryEntries({ directoryEntries: data.directoryEntries, fieldTagKey: EXIF_KEY });
    const exifDirectoryEntries = exifDirectoryEntry?.child.directoryEntries;

    const dateTimeOriginal = getASCIIFromDirectoryEntries({ directoryEntries: exifDirectoryEntries, fieldTagKey: DATE_TIME_ORIGINAL_KEY });
    const dateTimeDigitized = getASCIIFromDirectoryEntries({ directoryEntries: exifDirectoryEntries, fieldTagKey: DATE_TIME_DIGITIZED_KEY });
    const subSecTime = getASCIIFromDirectoryEntries({ directoryEntries: exifDirectoryEntries, fieldTagKey: SUB_SEC_TIME_KEY });
    const subSecTimeOriginal = getASCIIFromDirectoryEntries({ directoryEntries: exifDirectoryEntries, fieldTagKey: SUB_SEC_TIME_ORIGINAL_KEY });
    const subSecTimeDigitized = getASCIIFromDirectoryEntries({ directoryEntries: exifDirectoryEntries, fieldTagKey: SUB_SEC_TIME_DIGITIZED_KEY });
    
    return { success: true, data: { dateTime, dateTimeOriginal, dateTimeDigitized, subSecTime, subSecTimeOriginal, subSecTimeDigitized } };
}