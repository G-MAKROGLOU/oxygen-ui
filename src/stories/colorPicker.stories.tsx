import { Meta, StoryFn } from '@storybook/react';
import ThemeProvider from '../context/themeContext';
import { ColorPicker } from '../components/inputs';
import { useState } from 'react';

export default {
	title: 'Components/Forms/Inputs/ColorPicker',
	component: ColorPicker,
	tags: ['autodocs'],
	argTypes: {
        colorPickerRight: {
            control: { type: 'boolean' },
            description: 'If the color picker has children, it will be displayed on the right of those children',
            defaultValue: false
        },
        colors: {
            control: { type: 'object' },
            description: 'An array of all the colors you want to be available',
            defaultValue: '#000'
        },
        value: {
            control: { type: 'string' },
            description: 'The current value of the color picker',
            defaultValue: ''
        },
        onChange: {
            defaultValue: null   
        },
        swatchShape: {
            control: { type: 'select' },
			options: ['circle', 'rounded', 'square'],
			description: 'The shape of the value box and the swatches',
			defaultValue: 'circle',
        },
        swatchSize: {
            control: { type: 'number' },
            description: 'The size of the value box and the swatches',
            defaultValue: 40
        }
		//size: {
			//control: { type: 'select' },
			//options: ['sm', 'md', 'lg', 'xl'],
			//description: 'The size of the avatar',
			//defaultValue: 'md',
		//},
		//shape: {
		//	control: { type: 'select' },
		//	options: ['circle', 'rounded', 'square'],
		//	description: 'The shape of the avatar',
		//	defaultValue: 'circle',
		//},
		//mode: {
		//	control: { type: 'select' },
		//	options: ['img', 'initials'],
		//	description: 'The mode of the avatar',
		//},
	},
	decorators: [(Story) => <ThemeProvider>{Story()}</ThemeProvider>],
} as Meta<typeof ColorPicker>;

const WithoutChildrenTemplate: StoryFn<typeof ColorPicker> = (args) => {
    const [value, setValue] = useState('');
    return (
        <ColorPicker 
            {...args}
            value={value}
            onChange={e => setValue(e.target.value)}
        />
    )
};

export const WithoutChildren = WithoutChildrenTemplate.bind({})
WithoutChildren.args = {
    colors: ['#000', '#fff'],
    swatchShape: 'circle',
    swatchSize: 40
};


const WithChildrenTemplate: StoryFn<typeof ColorPicker> = (args) => {
    const [value, setValue] = useState('');
    return (
        <ColorPicker 
            {...args}
            value={value}
            onChange={e => setValue(e.target.value)}
        />
    )
};

export const WithChildren = WithChildrenTemplate.bind({})
WithChildren.args = {
    colors: ['#000', '#fff'],
    swatchShape: 'circle',
    swatchSize: 40
};