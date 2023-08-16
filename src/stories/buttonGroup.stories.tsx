import { ComponentMeta, ComponentStory } from '@storybook/react';
import {ButtonGroup} from '../components/buttons';
import ThemeProvider from '../context/themeContext';
import { MdGridView, MdList, MdTableChart } from 'react-icons/md'

export default {
  title: 'Components/User Input/Buttons/ButtonGroup',
  component: ButtonGroup,
  argTypes: {
    defaultKey: {
        control: {type: 'text'},
        description: 'The key of the button to be active by default upon component initialization'
    },
    onClick: {
        description: 'The event fired when a button is clicked. The event gives you access to the key of the clicked button and is of type ```(newKey: string | number) => void;```'
    },
    buttons: {
        description: 'An array of items describing each button. Corner radius styles will be applied automatically to the first and last elements. Check ```ButtonPart``` type in ```buttonGroup.d.ts``` or the examples for a complete list of the properties each item can receive.'
    }
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        {Story()}
      </ThemeProvider>
    ),
  ],
} as ComponentMeta<typeof ButtonGroup>;

const Template: ComponentStory<typeof ButtonGroup> = (args) => <ButtonGroup {...args} />;

export const BasicButtonGroup = Template.bind({})
BasicButtonGroup.args = {
    defaultKey: '1',
    onClick: (newKey: string | number) => console.log(newKey),
    buttons: [
        {
            key: '1',
            type: 'success',
            content: 'Success',
        },
        {
            key: '2',
            type: 'warning',
            content: 'Warning',
        },
        {
            key: '3',
            type: 'danger',
            content: 'Danger',
        }
    ]
}


export const IconButtonGroup = Template.bind({})
IconButtonGroup.args = {
    defaultKey: '1',
    onClick: (newKey: string | number) => console.log(newKey),
    buttons: [
        {
            key: '1',
            type: 'success',
            icon: <MdGridView fontSize={15}/>
        },
        {
            key: '2',
            type: 'warning',
            icon: <MdList fontSize={15}/>,
        },
        {
            key: '3',
            type: 'danger',
            icon: <MdTableChart fontSize={15}/>,
        }
    ]
}


export const ContentIconButtonGroup = Template.bind({})
ContentIconButtonGroup.args = {
    defaultKey: '1',
    onClick: (newKey: string | number) => console.log(newKey),
    buttons: [
        {
            key: '1',
            type: 'primary',
            icon: <MdGridView fontSize={15}/>,
            content: "Grid"
        },
        {
            key: '2',
            type: 'primary',
            icon: <MdList fontSize={15}/>,
            content: "List"
        },
        {
            key: '3',
            type: 'primary',
            icon: <MdTableChart fontSize={15}/>,
            content: "Table"
        }
    ]
}