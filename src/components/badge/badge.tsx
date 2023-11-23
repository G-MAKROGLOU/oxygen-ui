import React from 'react';
import { BadgeProps } from '../../types/badge';

const Badge = ({
	background = 'tomato',
	color = 'white',
	shape = 'circle',
	variant = 'filled',
	position = 'topRight',
	content,
	children,
}: BadgeProps) => {
	const calcStyles = React.useMemo(() => {
		let baseClass = `oxyui__badge oxyui__badge__${shape}`;

		const baseStyle: React.CSSProperties = {
			position: 'relative',
			background,
			color,
		};

		if (children && position) {
			baseClass += ` oxyui__badge__${position}`;
			baseStyle.position = 'absolute';
		}

		if (variant === 'outlined') {
			baseClass += ` oxyui__badge__${variant}`;
			baseStyle.background = 'transparent';
			baseStyle.borderColor = background;
			baseStyle.color = background;
		}

		return {
			className: baseClass,
			style: baseStyle,
		};
	}, [shape, variant, position, children, background, color]);

	return (
		<div className="oxyui__badge__wrapper">
			<div className={calcStyles.className} style={calcStyles.style}>
				<span className="oxyui__badge__content">{content}</span>
			</div>
			<div>{children}</div>
		</div>
	);
};
export default Badge;
