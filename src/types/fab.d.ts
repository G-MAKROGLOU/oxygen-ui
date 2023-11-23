import { BasicButtonTypes, Positions } from './misc';

export type FABProps = {
	type?: BasicButtonTypes;
	style?: React.CSSProperties;
	disabled?: boolean;
	icon: JSX.Element;
	position?: Positions;
} & (StandaloneFAB | RolloutFAB);

export type StandaloneFAB = {
	mode: 'single';
	onClick: () => void;
};

export type RolloutFAB = {
	mode: 'rollout';
	items: RolloutFABItem[];
	onClick: (clickedKey: string | number) => void;
};

export type RolloutFABItem = {
	key: string | number;
	icon: JSX.Element;
	type: BasicButtonTypes;
	disabled?: boolean;
};
