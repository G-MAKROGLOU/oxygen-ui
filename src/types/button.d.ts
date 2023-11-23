import React from 'react';
import { AllButtonTypes } from './misc';

export interface ButtonProps {
	type?: AllButtonTypes;
	buttonType?: 'button' | 'submit' | 'reset';
	icon?: JSX.Element;
	loading?: boolean;
	disabled?: boolean;
	content: string;
	onClick?: () => void;
	iconRight?: boolean;
	loadingIcon?: JSX.Element;
	style?: React.CSSProperties;
}
