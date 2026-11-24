const InputGroup = ({type, placeholder, name, onChange, label, value, min, step, accept, inputRef }) =>{
    return (
        <div className="input-group mb-3">
            <span className="input-group-text">{label}</span>
            <input
                className="form-control"
                type={type}
                placeholder={placeholder}
                name={name}
                onChange={onChange}
                value={value}
                min={min}
                step={step}
                accept={accept}
                ref={inputRef}
            />
        </div>
    );
}

export default InputGroup;
