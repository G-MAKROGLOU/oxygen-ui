import { ComponentMeta, ComponentStory } from '@storybook/react';
import {MenuButton} from '../components/buttons';
import ThemeProvider from '../context/themeContext';
import { MdHome, MdAccountCircle, MdPayments, MdReceipt, MdSettings, MdPowerSettingsNew } from 'react-icons/md'
import { AiFillCaretDown } from 'react-icons/ai'


export default {
  title: 'Components/User Input/Buttons/MenuButton',
  component: MenuButton,
  argTypes: {
    mainButtonContent: {
        control: {type: 'text'},
        description: 'The text value of the left main button',
        defaultValue: 'Main'
    },
    mainButtonIcon: {
        description: 'Any valid JSX element but keep in mind that you can break the styling if you insert arbitrary elements other than an icon. Check ```react-icons npm package``` for a variety of JSX icons.',
        defaultValue: null
    },
    mainButtonType: {
        options: ['primary', 'secondary', 'info', 'success', 'warning', 'danger'],
        control: { type: 'select' },
        description: 'The main button style type',
        defaultValue: 'primary'
    },
    secondaryButtonType: {
        options: ['primary', 'secondary', 'info', 'success', 'warning', 'danger'],
        control: { type: 'select' },
        description: 'The main button style type',
        defaultValue: 'primary'
    },
    secondaryButtonIconButtonIcon: {
        description: 'Any valid JSX element but keep in mind that you can break the styling if you insert arbitrary elements other than an icon. Check ```react-icons npm package``` for a variety of JSX icons. Defaults to ```<AiFillCaretDown fontSize={15}/>``` from ```react-icons/ai```',
        defaultValue: <AiFillCaretDown fontSize={15}/>
    },
    onClick: {
        description: 'The onClick event fired when the main or a menu item of the secondary button is clicked. The event is of type ``` (isMain: boolean; key?: string | number) => void;``` . When clicking the main button you will receive ```(true, undefined)```. When clicking the secondary item you will receive ```(false, [someKey])```'
    },
    menuItems: {
        description: 'An array of items to be rendered when the secondary button is clicked. Check ```MenuButtonItem``` type from ```menuButton.d.ts``` or the example for a complete list of the properties of each item.'
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        {Story()}
      </ThemeProvider>
    ),
  ],
} as ComponentMeta<typeof MenuButton>;

const Template: ComponentStory<typeof MenuButton> = (args) => <MenuButton {...args} />;

export const BasicMenuButton = Template.bind({})
BasicMenuButton.args = {
    mainButtonContent: "Home",
    mainButtonType: 'primary',
    mainButtonIcon: <MdHome fontSize={15}/>,
    secondaryButtonType: 'secondary',
    menuItems: [
        {
            key: 1,
            label: "My Profile",
            icon: <MdAccountCircle fontSize={15}/>
        },
        {
            key: 2,
            label: "Payment methods",
            icon: <MdPayments fontSize={15}/>
        },
        {
            key: 3,
            label: "My Orders",
            icon: <MdReceipt fontSize={15}/>
        },
        {
            key: 4,
            label: "Settings",
            icon: <MdSettings fontSize={15}/>
        },
        {
            key: 5,
            divider: true,
        },
        {
            key: 6,
            label: "Sign Out",
            icon: <MdPowerSettingsNew fontSize={15}/>
        },
    ],
    onClick: (isMain: boolean, secondaryKey?: string | number) => console.log(isMain, secondaryKey)
}