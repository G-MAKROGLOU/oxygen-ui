import React from 'react';
import { useTheme } from '../../hooks';
import { AccordionProps, AccordionRefMap } from '../../types/accordion';
import { MdKeyboardArrowDown } from 'react-icons/md';

const Accordion = ({
	defaultActiveKey,
	defaultAllExpanded = false,
	multipleExpands = false,
	onExpand,
	onCollapse,
	accordionIcon,
	items,
	width = 400,
}: AccordionProps) => {
	const { theme } = useTheme();
	const contentMap: AccordionRefMap[] = React.useMemo(() => [], []);
	const iconMap: AccordionRefMap[] = React.useMemo(() => [], []);

	const oxyOnClick = (clickedKey: string | number) => {
		if (multipleExpands) {
			multipleExpandsClick(clickedKey);
			return;
		}
		singleExpandClick(clickedKey);
	};

	const addContentToRefMap = (
		ref: HTMLElement | null,
		key: string | number,
	) => {
		const isExpanded = defaultAllExpanded || defaultActiveKey === key;
		const exists = contentMap.find((refPair) => refPair.key === key);
		if (!exists && ref) {
			const refContent = ref?.firstChild as HTMLElement;
			const refContentBbox = refContent.getBoundingClientRect();
			ref.style.maxHeight = isExpanded
				? `${refContentBbox.height}px`
				: '0px';
			contentMap.push({ key, ref, isExpanded });
		}
	};

	const addIconToRefMap = (ref: HTMLElement | null, key: string | number) => {
		const isExpanded = defaultAllExpanded || defaultActiveKey === key;
		const exists = iconMap.find((refPair) => refPair.key === key);
		if (!exists && ref) {
			ref.style.transform = isExpanded
				? 'rotate(180deg)'
				: 'rotate(0deg)';
			iconMap.push({ key, ref, isExpanded });
		}
	};

	const multipleExpandsClick = (clickedKey: string | number) => {
		const refPair: AccordionRefMap | undefined = contentMap.find(
			(refPair) => refPair.key === clickedKey,
		);
		const iconPair: AccordionRefMap | undefined = iconMap.find(
			(refPair) => refPair.key === clickedKey,
		);
		if (refPair && iconPair) {
			if (refPair.ref && iconPair.ref) {
				const refContent = refPair.ref.firstChild as HTMLElement;
				const refContentBbox = refContent.getBoundingClientRect();
				refPair.ref.style.maxHeight = refPair.isExpanded
					? '0px'
					: `${refContentBbox.height}px`;
				iconPair.ref.style.transform = iconPair.isExpanded
					? 'rotate(0deg)'
					: 'rotate(180deg)';

				if (refPair.isExpanded) {
					if (onExpand) {
						onExpand(clickedKey);
					}
				}
				if (!refPair.isExpanded) {
					if (onCollapse) {
						onCollapse(clickedKey);
					}
				}
				contentMap.forEach((refPair) => {
					if (refPair.key === clickedKey) {
						refPair.isExpanded = !refPair.isExpanded;
					}
				});
				iconMap.forEach((refPair) => {
					if (refPair.key === clickedKey) {
						refPair.isExpanded = !refPair.isExpanded;
					}
				});
			}
		}
	};

	const singleExpandClick = (clickedKey: string | number) => {
		contentMap.forEach((refPair) => {
			if (refPair.ref) {
				if (refPair.key === clickedKey) {
					const refContent = refPair.ref?.firstChild as HTMLElement;
					const refContentBbox = refContent.getBoundingClientRect();
					refPair.ref.style.maxHeight = refPair.isExpanded
						? '0px'
						: `${refContentBbox.height}px`;
					refPair.isExpanded = !refPair.isExpanded;
				} else {
					refPair.ref.style.maxHeight = '0px';
					refPair.isExpanded = false;
				}
			}
		});

		iconMap.forEach((refPair) => {
			if (refPair.ref) {
				if (refPair.key === clickedKey) {
					refPair.ref.style.transform = refPair.isExpanded
						? 'rotate(0deg)'
						: 'rotate(180deg)';
					refPair.isExpanded = !refPair.isExpanded;
				} else {
					refPair.ref.style.transform = 'rotate(0deg)';
					refPair.isExpanded = false;
				}
			}
		});
	};

	return (
		<div style={{ width }}>
			{items?.map((item) => (
				<div key={item.key}>
					<div
						className={`oxyui__accordion__panel__collapse oxyui__accordion__panel__collapse__${theme}`}
						onClick={() => oxyOnClick(item.key)}
					>
						<div className="oxyui__accordion__panel__header">
							{item.header}
						</div>
						<div>
							<span
								ref={(ref) => addIconToRefMap(ref, item.key)}
								className="oxyui__accordion__panel__header__icon"
							>
								{accordionIcon ? (
									accordionIcon
								) : (
									<MdKeyboardArrowDown fontSize={25} />
								)}
							</span>
						</div>
					</div>
					<div
						ref={(ref) => addContentToRefMap(ref, item.key)}
						className={`oxyui__accordion__panel__content`}
					>
						{item.content}
					</div>
				</div>
			))}
		</div>
	);
};

export default Accordion;
