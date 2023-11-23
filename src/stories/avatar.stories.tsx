import { Meta, StoryFn } from '@storybook/react';
import { Avatar } from '../components/avatar';
import ThemeProvider from '../context/themeContext';

export default {
	title: 'Components/Data Display/Avatar',
	component: Avatar,
	tags: ['autodocs'],
	argTypes: {
		size: {
			control: { type: 'select' },
			options: ['sm', 'md', 'lg', 'xl'],
			description: 'The size of the avatar',
			defaultValue: 'md',
		},
		shape: {
			control: { type: 'select' },
			options: ['circle', 'rounded', 'square'],
			description: 'The shape of the avatar',
			defaultValue: 'circle',
		},
		mode: {
			control: { type: 'select' },
			options: ['img', 'initials'],
			description: 'The mode of the avatar',
		},
	},
	decorators: [(Story) => <ThemeProvider>{Story()}</ThemeProvider>],
} as Meta<typeof Avatar>;

const Template: StoryFn<typeof Avatar> = (args) => <Avatar {...args} />;

export const ImageAvatar = Template.bind({});
ImageAvatar.args = {
	mode: 'img',
	imgSrc: 'https://randomuser.me/api/portraits/lego/6.jpg',
	shape: 'circle',
	size: 'lg',
};

export const ImageAvatarWithFallback = Template.bind({});
ImageAvatarWithFallback.args = {
	mode: 'img',
	imgSrc: 'https://some-non-existing-url-or-image',
	shape: 'circle',
	size: 'lg',
	fallback: {
		initials: 'OX',
		background: 'royalblue',
		color: 'white',
	},
};

export const InitialsAvatar = Template.bind({});
InitialsAvatar.args = {
	mode: 'initials',
	initials: 'OX',
	background: 'tomato',
	color: 'white',
	shape: 'circle',
	size: 'lg',
};

export const FullBlownAvatarFeatures = Template.bind({});
FullBlownAvatarFeatures.args = {
	mode: 'img',
	imgSrc: 'https://randomuser.me/api/portraits/lego/6.jpg',
	shape: 'circle',
	size: 'lg',
	fallback: {
		initials: 'OXYGEN UI',
		background: 'royalblue',
		color: 'white',
	},
	badgeColor: 'lightgreen',
};
