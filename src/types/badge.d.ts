import { Positions, Shapes } from './misc';

export type BadgeProps = {
	background: string;
	color: string;
	shape: Shapes;
	content: string | number | JSX.Element;
	children?: JSX.Element;
	position?: Positions;
	variant?: 'filled' | 'outlined';
};
