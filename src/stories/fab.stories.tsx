import { ComponentMeta, ComponentStory } from '@storybook/react';
import {FAB} from '../components/buttons';
import ThemeProvider from '../context/themeContext';
import { MdAdd, MdChatBubble } from 'react-icons/md'
import { FaViber, FaWhatsapp, FaFacebookMessenger, FaTelegram } from 'react-icons/fa'

export default {
  title: 'Components/UserInput/Buttons/FAB',
  component: FAB,
  argTypes: {
    position: {
        options: ['bottomRight', 'topRight', 'bottomLeft', 'topLeft'],
        control: { type: 'select' },
        description: '[Optional, can be overwritten with style] The FAB position. By design, FABs are anchored to some screen corner, usually on the bottom right or left. By default the ```oxyui__iconbutton``` class has ```position: absolute``` so you only have to adjust ```top, right, bottom, left ```. Keep in mind that when using ```mode="rollout"``` the items won\'t adjust along with your custom positioning.',
        defaultValue: null
    },
    mode: {
        options: ['single', 'rollout'],
        control: { type: 'select' },
        description: '```single``` renders a simple FAB. ```rollout``` renders a FAB that by clicking it, other options roll out.',
        defaultValue: null
    },
    type: {
        options: ['primary', 'secondary', 'info', 'success', 'warning', 'danger'],
        control: { type: 'select' },
        description: 'The button style type',
        defaultValue: 'primary'
    },
    onClick: {
        description: 'The onClick event fired when a FAB, or a FAB item is clicked. When ```mode="single"``` the event is of ```type () => void;``` . When ```mode="rollout"``` the event is of type ```(key: string | number) => void;``` '
    },
    items: {
        if: { arg: 'mode', eq: 'rollout' },
        description: 'The properties of the items that will roll out when a ```mode="rollout"``` FAB is clicked'
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        {Story()}
      </ThemeProvider>
    ),
  ],
} as ComponentMeta<typeof FAB>;

const Template: ComponentStory<typeof FAB> = (args) => <FAB {...args} />;

export const SingleFAB = Template.bind({})
SingleFAB.args = {
    type: 'primary',
    mode: 'single',
    onClick: () => alert("Clicked on FAB"),
    icon: <MdAdd fontSize={25}/>,
    position: 'bottomRight'
}


export const RolloutFAB = Template.bind({})
RolloutFAB.args = {
    type: 'primary',
    mode: 'rollout',
    icon: <MdChatBubble fontSize={25}/>,
    position: 'bottomLeft',
    onClick: (key: string | number) => alert(`Clicked on Rollout key: ${key}`),
    items: [
        {
            key: 1,
            icon: <FaViber fontSize={25}/>,
            type: 'info'
        },
        {
            key: 2,
            icon: <FaWhatsapp fontSize={25}/>,
            type: 'success'
        },
        {
            key: 3,
            icon: <FaFacebookMessenger fontSize={25}/>,
            type: 'primary'
        },
        {
            key: 4,
            icon: <FaTelegram fontSize={25}/>,
            type: 'secondary'
        }
    ],
}