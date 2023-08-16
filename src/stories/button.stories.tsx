import { ComponentMeta, ComponentStory } from '@storybook/react';
import {Button} from '../components/buttons';
import ThemeProvider from '../context/themeContext';
import { AiOutlineSave, AiOutlineLoading3Quarters} from 'react-icons/ai'
import { rest } from 'msw'

export default {
  title: 'Components/User Input/Buttons/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    type: {
      options: ['primary', 'secondary', 'outlined', 'link', 'info', 'success', 'warning', 'danger'],
      control: { type: 'select' },
      description: 'The button style type',
      defaultValue: 'primary'
    },
    content: {
        control: {type: 'text'},
        description: 'The text value of the button',
        defaultValue: 'Button'
    },
    buttonType: {
        options: ['button', 'submit'],
        control: { type: 'select'},
        description: 'The button html type. Submit is suitable when the button is used in forms.'
    },
    loading: {
        options: [true, false],
        control: { type: 'radio'},
        description: 'The loading state of the button',
        defaultValue: false
    },
    disabled: {
        options: [true, false],
        control: { type: 'radio'},
        description: 'The disabled state of the button',
        defaultValue: false
    },
    iconRight: {
        options: [true, false],
        control: { type: 'radio'},
        description: 'Whether the icon should be on the right or no',
        defaultValue: false
    },
    onClick: {
        description: 'The event fired when the button is clicked. ```() => void```',
        defaultValue: null
    },
    icon: {
        description: 'Any valid JSX element but keep in mind that you can break the styling if you insert arbitrary elements other than an icon. Check ```react-icons npm package``` for a variety of icons.',
        defaultValue: null
    },
    loadingIcon: {
        description: 'Same with the ```icon``` prop but the icon is used for the loading state of the button. If ommited the default loading icon will be used.',
        defaultValue: null
    },
    style: {
        description: 'Any valid JSS property to reset or tweak the style of the button.',
        defaultValue: {}
    }
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        {Story()}
      </ThemeProvider>
    ),
  ],
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const BasicButton = Template.bind({})
BasicButton.args = {
    type: 'primary',
    content: 'Click Me!',
    buttonType: 'button',
    loading: false,
    disabled: false,
    onClick: () => {
        fetch('/api/v1/login')
        .then(res => res.json())
        .then(console.log)
    },
    iconRight: false,
    icon: <AiOutlineSave fontSize={16}/>,
    loadingIcon: <AiOutlineLoading3Quarters fontSize={16}/>,
    style: { }
}
