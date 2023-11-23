import { AllButtonTypes } from './misc';

export type IconButtonProps = {
	icon: JSX.Element;
	onClick: () => void;
	type: AllButtonTypes;
	style?: React.CSSProperties;
	loading?: boolean;
	disabled?: boolean;
	loadingIcon?: JSX.Element;
};
