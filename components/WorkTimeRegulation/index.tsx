// import { useState } from "react";

// import { alertUtil } from "../../utils/utils";

// import styles from './index.module.css';

// type FormValues = WorkTimeRegulationType;
// type FormValuesKey = keyof FormValues;

// type Props = {
//     formValues: FormValues;
//     onSubmit: React.Dispatch<React.SetStateAction<WorkTimeRegulationType>>;
// };
// function WorkTimeRegulation({ formValues, onSubmit }: Props) {
//     const [disabled, setDisabled] = useState(true);

//     const [formValuesState, setFormValuesState] = useState(formValues);

//     return (
//         <div className={styles.add_pop_day_wrapper}>
//             <form
//                 onSubmit={(e) => {
//                     e.preventDefault();
//                     const nextFormValues: FormValues = formValuesState;
//                     const formValuesKey = Object.keys(nextFormValues) as FormValuesKey[];

//                     const formData = new FormData(e.target);
//                     for (const [key, value] of formData) {
//                         const k = key as FormValuesKey;
//                         if (!formValuesKey.includes(k)) {
//                             const errorMessage = `incorrect key(${k}) of form data in WorkTimeRegulation`;
//                             alertUtil(errorMessage);
//                             return;
//                         }
//                         if (typeof value !== 'string' || !value) {
//                             const errorMessage = `incorrect value(${value}) of form data in WorkTimeRegulation`;
//                             alertUtil(errorMessage);
//                             return;
//                         }

//                         nextFormValues[k] = value;
//                     }

//                     onSubmit(nextFormValues);
//                     setDisabled(true);
//                 }}
//             >
//                 <div className={styles.form_content_wrapper}>
//                     <button type="button" onClick={() => setDisabled(false)}>Enable</button>
//                     上午：
//                     <input
//                         disabled={disabled}
//                         type="time"
//                         className={styles.input_date}
//                         name="morningStartPlainTimeString"
//                         value={formValuesState.morningStartPlainTimeString}
//                         onChange={(e) => setFormValuesState((prevState) => ({...prevState, morningStartPlainTimeString: e.target.value }))}
//                     />
//                     ~
//                     <input
//                         disabled={disabled}
//                         type="time"
//                         className={styles.input_date}
//                         name="morningEndPlainTimeString"
//                         value={formValuesState.morningEndPlainTimeString}
//                         onChange={(e) => setFormValuesState((prevState) => ({...prevState, morningEndPlainTimeString: e.target.value }))}
//                     />
//                     下午：
//                     <input
//                         required
//                         disabled={disabled}
//                         className={styles.input_date}
//                         type="time"
//                         name="afternoonStartPlainTimeString"
//                         value={formValuesState.afternoonStartPlainTimeString}
//                         onChange={(e) => setFormValuesState((prevState) => ({...prevState, afternoonStartPlainTimeString: e.target.value }))}
//                     />
//                     ~
//                     <input
//                         required
//                         disabled={disabled}
//                         type="time"
//                         className={styles.input_date}
//                         name="afternoonEndPlainTimeString"
//                         value={formValuesState.afternoonEndPlainTimeString}
//                         onChange={(e) => setFormValuesState((prevState) => ({...prevState, afternoonEndPlainTimeString: e.target.value }))}
//                     />
//                     <button disabled={disabled} type="submit">Change</button>
//                 </div>
//             </form>
//         </div>
//     )
// }

// export default WorkTimeRegulation;