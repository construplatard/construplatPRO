export function Input({label,...props}:React.InputHTMLAttributes<HTMLInputElement>&{label:string}){return <label>{label}<input {...props}/></label>}
export function Select({label,children,...props}:React.SelectHTMLAttributes<HTMLSelectElement>&{label:string}){return <label>{label}<select {...props}>{children}</select></label>}
export function TextArea({label,...props}:React.TextareaHTMLAttributes<HTMLTextAreaElement>&{label:string}){return <label className="wide">{label}<textarea {...props}/></label>}
