import React from 'react';
import type { DynamicWildCardType } from './misc';

export type FormProps = {
	items: FormItemProps[];
	onSubmit: (data: DynamicWildCardType) => void;
	onChange?: (
		newValue: DynamicWildCardType,
		data: DynamicWildCardType,
	) => void;
	layout?: 'horizontal' | 'vertical';
	form?: UseFormProps;
	button?: {
		enabled: boolean;
		props: {
			type: string;
			content: string;
		};
	};
};

type UseFormProps = {
	formRef: React.RefObject<HTMLFormElement>;
	submit: () => void;
};

export interface FormHookProps
	extends React.ForwardRefExoticComponent<
		FormProps & React.RefAttributes<HTMLFormElement>
	> {
	useForm: () => UseFormProps;
}

export type FormItemProps = {
	name: string;
	type:
		| 'text'
		| 'password'
		| 'number'
		| 'select'
		| 'checkbox'
		| 'radio'
		| 'file'
		| 'switch'
		| 'group';
	label?: string;
	validation?: (value: any) => void;
	icon?: JSX.Element;
	info?: {
		enabled: boolean;
		message: string;
	};
};
