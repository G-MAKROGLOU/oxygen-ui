import { ComponentMeta, ComponentStory } from '@storybook/react';
import {Calendar} from '../components/calendar';
import ThemeProvider from '../context/themeContext';
import { AiOutlineSave, AiOutlineLoading3Quarters} from 'react-icons/ai'

export default {
  title: 'Components/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  argTypes: {
   
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        {Story()}
      </ThemeProvider>
    ),
  ],
} as ComponentMeta<typeof Calendar>;

const Template: ComponentStory<typeof Calendar> = (args) => <div style={{ width: window.innerWidth - 100, height: window.innerHeight }}>
    <Calendar {...args} />
</div>;

export const BasicCalendar = Template.bind({})
BasicCalendar.args = {
    //type: 'primary',
    //content: 'Click Me!',
    //buttonType: 'button',
    //loading: false,
    //disabled: false,
    //onClick: () => console.log("Clicked the button"),
    //iconRight: false,
    //icon: <AiOutlineSave fontSize={16}/>,
    //loadingIcon: <AiOutlineLoading3Quarters fontSize={16}/>,
    //style: { }
}
