import { ComponentMeta, ComponentStory } from '@storybook/react';
import {Breadcrumbs} from '../components/breadcrumbs';
import ThemeProvider from '../context/themeContext';
import { MdOutlineHome, MdAccountCircle, MdSettings } from 'react-icons/md'
import { BiArrowFromLeft } from 'react-icons/bi'
import { RxSlash } from 'react-icons/rx'

export default {
  title: 'Components/Navigation/Breadcrumbs',
  component: Breadcrumbs,
  argTypes: {
    items: {
        description: 'An array of items to be displayed as the breadrumb items. Update the array of ```items``` accordingly when you navigate between screens through state management manually or through the ```onClick``` event handler when ```asLinks=true``. See ```BreadcrumbItem``` from ```breadcrumbs.d.ts``` '
    },
    activeKey: {
        control: {type: 'number', min: 1, max: 3},
        description: 'The active breadcrumb key. Update the ```activeKey``` accordingly when you navigate between screens through state management manually or through the ```onClick``` event handler when ```asLinks=true```'
    },
    separator: {
        description: 'The breadcrumb separator. e.g. ```<BiArrowFromLeft/>```',
        defaultValue: <RxSlash/>,
    },
    onClick: {
        description: 'The event fired when a user clicks on a breadcrumb item and ```asLinks=true```'
    },
    asLinks: {
        control: {type: 'boolean'},
        description: 'Whether the breadcrumb items are clickable as links or not. If you set ```asLinks=true``` then you should also provide an ```onClick``` event handler to handle the event as you wish. Defaults to ```false```',
    }
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        {Story()}
      </ThemeProvider>
    ),
  ],
} as ComponentMeta<typeof Breadcrumbs>;

const Template: ComponentStory<typeof Breadcrumbs> = (args) => <Breadcrumbs {...args} />;

export const BasicBreadcrumbs = Template.bind({})
BasicBreadcrumbs.args = {
    asLinks: true,
    separator: <BiArrowFromLeft/>,
    onClick: (key: string | number) => console.log(key),
    activeKey: 2,
    items: [
        {
            key: 1,
            value: 'Home',
            icon: <MdOutlineHome/>
        },
        {
            key: 2,
            value: 'Profile',
            icon: <MdAccountCircle/>
        },
        {
            key: 3,
            value: 'Settings',
            icon: <MdSettings/>
        },
    ]
}
