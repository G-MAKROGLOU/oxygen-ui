import { ComponentMeta, ComponentStory } from '@storybook/react';
import {IconButton} from '../components/buttons';
import ThemeProvider from '../context/themeContext';
import { AiOutlineDelete, AiOutlineLoading3Quarters} from 'react-icons/ai'

export default {
  title: 'Components/User Input/Buttons/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    type: {
      options: ['primary', 'secondary', 'outlined', 'link', 'info', 'success', 'warning', 'danger'],
      control: { type: 'select' },
      description: 'The button style type',
      defaultValue: 'primary'
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
} as ComponentMeta<typeof IconButton>;

const Template: ComponentStory<typeof IconButton> = (args) => <IconButton {...args} />;

export const BasicIconButton = Template.bind({})
BasicIconButton.args = {
    type: 'danger',
    onClick: () => console.log("Clicked the icon button"),
    icon: <AiOutlineDelete fontSize={16}/>,
    loading: false,
    disabled: false,
    loadingIcon: <AiOutlineLoading3Quarters fontSize={16}/>,
    style: { }
}
