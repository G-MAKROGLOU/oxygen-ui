import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Badge } from '../components/badge';
import ThemeProvider from '../context/themeContext';
import { MdNotifications } from 'react-icons/md';

export default {
	title: 'Components/Data Display/Badge',
	component: Badge,
	tags: ['autodocs'],
	argTypes: {
		position: {
			control: { type: 'select' },
			options: ['topRight', 'bottomRight', 'topLeft', 'bottomLeft'],
			description:
				'The position of the badge. It is taken into account only when the badge is used with children.',
		},
		shape: {
			control: { type: 'select' },
			options: ['circle', 'rounded', 'square'],
			description: 'The shape of the badge',
			defaultValue: 'circle',
		},
		variant: {
			control: { type: 'select' },
			options: ['filled', 'outlined'],
			description: 'The variant of the badge. ',
		},
		content: {
			description: 'The content of the badge',
		},
		background: {
			control: { type: 'color' },
			description:
				'The background color of the badge. Defaults to ```tomato```',
			defaultValue: 'tomato',
		},
		color: {
			control: { type: 'color' },
			description: 'The text color of the badge. Defaults to ```white```',
			defaultValue: 'white',
		},
		children: {
			description:
				'[Optional]. If the badge has children, the position property will take effect and the badge will be attached to that position on the element that is nested within it. Usage: <Badge>\n<div></div>\n</Badge>',
		},
	},
	decorators: [(Story) => <ThemeProvider>{Story()}</ThemeProvider>],
} as ComponentMeta<typeof Badge>;

const Template: ComponentStory<typeof Badge> = (args) => <Badge {...args} />;

export const DefaultBadge = Template.bind({});
DefaultBadge.args = {
	content: 23,
};

export const BadgeWithCustomColors = Template.bind({});
BadgeWithCustomColors.args = {
	background: 'royalblue',
	color: 'gold',
	content: 'Custom',
};

export const OutlinedBadge = Template.bind({});
OutlinedBadge.args = {
	background: 'royalblue',
	color: 'gold',
	content: 'Custom',
	variant: 'outlined',
};

export const BadgeOnIconSocialMediaStyle = Template.bind({});
BadgeOnIconSocialMediaStyle.args = {
	background: 'tomato',
	color: 'white',
	content: (
		<span>
			23<sup>+</sup>
		</span>
	),
	variant: 'filled',
	position: 'topRight',
	children: <MdNotifications fontSize={30} />,
};

export const BadgeOnOtherElements = Template.bind({});
BadgeOnOtherElements.args = {
	background: 'tomato',
	color: 'white',
	content: (
		<span>
			23<sup>+</sup>
		</span>
	),
	variant: 'filled',
	position: 'topRight',
	children: (
		<div style={{ width: 200, height: 300, overflow: 'scroll' }}>
			Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut
			necessitatibus adipisci assumenda, illo iure voluptate quam
			laudantium saepe natus possimus cum blanditiis repellendus magni
			excepturi dolorem facilis a? Voluptatibus, maiores magnam blanditiis
			similique esse voluptate soluta. Nesciunt omnis sequi, ex amet quasi
			inventore dolore fuga aperiam illo architecto nobis reprehenderit.
		</div>
	),
};
