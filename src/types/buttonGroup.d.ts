import React from 'react';
import { BasicButtonTypes } from './misc';

export interface ButtonGroupProps {
	defaultKey: string | number;
	buttons: ButtonPart[];
	onClick: (clickedKey: string | number) => void;
}

export interface ButtonPart {
	key: string | number;
	content?: string;
	icon?: JSX.Element;
	type: BasicButtonTypes;
	disabled?: boolean;
}
