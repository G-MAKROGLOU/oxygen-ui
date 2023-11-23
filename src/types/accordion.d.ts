import { RefMap } from './misc';

export type AccordionProps = {
	defaultActiveKey?: string | number;
	defaultAllExpanded?: boolean;
	multipleExpands?: boolean;
	onExpand?: (expandedKey: string | number) => void;
	onCollapse?: (collapsedKey: string | number) => void;
	accordionIcon?: JSX.Element;
	items: AccordionItem[];
	width?: number | string;
};

export type AccordionItem = {
	key: string | number;
	header?: string | JSX.Element;
	content?: JSX.Element;
};

export type AccordionRefMap = RefMap & {
	isExpanded: boolean;
};
