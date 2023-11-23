import React from 'react';
import { ScalarOpacityTransitionProps } from '../../types/transition';

const ScalarOpacityTransition = ({
	delay,
	counter,
	children,
}: ScalarOpacityTransitionProps) => {
	const [opacity, setOpacity] = React.useState(0);

	React.useEffect(() => {
		const timeout = setTimeout(() => {
			setOpacity(1);
		}, delay * counter);

		return () => clearTimeout(timeout);
	}, []);

	return <div style={{ transition: 'opacity .3s', opacity }}>{children}</div>;
};

export default ScalarOpacityTransition;
