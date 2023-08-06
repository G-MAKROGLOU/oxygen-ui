import React, { useEffect, useRef, useState } from "react";
import { FormProps, FormItemProps } from "../../types/form";
import { DynamicWildCardType } from "../../types/misc";

const Form = ({
    items, 
    onSubmit, 
    onChange, 
    layout = 'horizontal',
    form,
    button
}: FormProps) => {

    const [data, setData] = useState<DynamicWildCardType>({});

    useEffect(() => {
        const data: DynamicWildCardType = {};
        items.forEach(item => {
            data[item.name] = ''
        })
        setData(data)
    }, [])

    const innerSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(onSubmit) onSubmit(data)
    }

    const innerChange = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const target = event.target as HTMLInputElement
        const newData: DynamicWildCardType = {...data};
        newData[target.name] = target.value;
        setData(newData)
        if(onChange) onChange({[target.name]: target.value}, newData);
    }

    return (
        <form ref={form?.formRef} onSubmit={innerSubmit} onChange={innerChange}>
            <div className={`oxyui__form__${layout}`}>
                {items.map((item: FormItemProps) => (
                    <>
                        <label htmlFor={item.name}>{item.label}</label>
                        <input id={item.name} name={item.name} type={item.type}/>
                    </>
                ))}
                <button type="submit">Submit</button>
            </div>
        </form>
    )
};

const useForm = () => {
    const formRef = useRef<HTMLFormElement>(null);

    const submit = () => formRef.current?.requestSubmit();

    const reset = () => formRef.current?.reset();

    const setFieldValue = (key: string, value: string) => {
        const item: HTMLInputElement = formRef.current?.elements.namedItem(key) as HTMLInputElement
        item.value = value;
    }

    const getFieldValue = (key: string) => {
        const item: HTMLInputElement = formRef.current?.elements.namedItem(key) as HTMLInputElement
        return item.value;
    }

    return {
        formRef,
        submit,
        reset,
        getFieldValue,
        setFieldValue
    };
}

Form.useForm = useForm

export default Form;