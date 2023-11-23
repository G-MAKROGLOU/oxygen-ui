import { addons } from '@storybook/addons';
import { themes } from '@storybook/theming';
import oxygenTheme from './oxygentheme';

addons.setConfig({
	theme: oxygenTheme,
	isFullscreen: false,
	showNav: true,
	showPanel: true,
	panelPosition: 'bottom',
	enableShortcuts: true,
	isToolshown: true,
	selectedPanel: undefined,
	initialActive: 'sidebar',
	toolbar: {
		title: { hidden: false },
		zoom: { hidden: false },
		eject: { hidden: false },
		copy: { hidden: false },
		fullscreen: { hidden: false },
	},
});
