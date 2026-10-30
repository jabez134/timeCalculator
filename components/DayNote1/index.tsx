
// import { useState } from "react";

// import styles from './index.module.css';
// import { alertUtil } from "../../utils/utils";

// type FormValues = { dayText: string };
// type FormValuesKey = keyof FormValues;
// type Props = {
//     dayString: string;
//     dayText: string | undefined;
//     onChangeDayText: (dayText: string) => void;
// };
// const dayNoteKey = 'dayText';
// function DayNote({ dayString, dayText = '', onChangeDayText }: Props) {

//     // if input is read only => 1. There is input data in form data. 2. Can not valid data when submit form
//     // if input is disabled, there is not input data in form data( => can not valid data when submit form)

//     const [readOnly, setReadOnly] = useState(true);

//     return (
//         <div className={styles.day_text_wrapper}>
//             <form
//                 action={(formData) => {
//                     const nextFormValues: FormValues = { dayText: "" };
//                     const formValuesKey = Object.keys(nextFormValues) as FormValuesKey[];

//                     for (const [key, value] of formData) {
//                         console.log('{key, value}', {key, value});
                        
//                         const k = key as FormValuesKey;
//                         if (!formValuesKey.includes(k)) { 
//                             const errorMessage = `incorrect key(${k}) of form data in DayNote`;
//                             alertUtil(errorMessage);
//                             return;
//                         }
//                         if (typeof value !== 'string') {
//                             const errorMessage = `incorrect value(${value}) of form data in DayNote`;
//                             alertUtil(errorMessage);
//                             return;
//                         }
//                         nextFormValues[k] = value;
//                     }

//                     onChangeDayText(nextFormValues.dayText);
//                     setReadOnly(true);
//                 }}
//             >
//                 <div className={styles.form_content_wrapper}>
//                     <div>Day: {dayString}</div>
//                     <button type="button" disabled={!readOnly} onClick={() => setReadOnly(false)}>Enable</button>
//                     <input
//                         readOnly={readOnly}
//                         type="text"
//                         size={100}
//                         placeholder="备注"
//                         name={dayNoteKey}
//                         value={dayText}
//                         onChange={(e) => onChangeDayText(e.target.value)}
//                     />
//                     <button disabled={readOnly} type="submit">Submit</button>
//                 </div>
//             </form>
//         </div>
//     )
// }

// export default DayNote;