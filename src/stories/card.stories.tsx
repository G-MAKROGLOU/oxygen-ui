import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Card } from '../components/card';
import ThemeProvider from '../context/themeContext';
import { AiFillStar } from 'react-icons/ai';
import { BiHotel } from 'react-icons/bi';
import { GiKnifeFork } from 'react-icons/gi';
import { BsCurrencyDollar, BsFillPatchCheckFill, BsFillPersonFill, BsFillCalendarCheckFill } from 'react-icons/bs';
import { Button } from '../components/buttons';

export default {
	title: 'Components/Data Display/Card',
	component: Card,
	tags: ['autodocs'],
	argTypes: {
        elevationOnHover: {
            control: { type: 'boolean' },
            description: 'Whether the card should have an elevation effect on hover or not.',
            defaultValue: false
        },
        title: {
            control: { type: 'text' },
            description: 'The title of the card'
        },
        description: {
            description: 'Optional - A description text for the card. It can be a string or any valid JSX. In case of JSX the styling is up to you. See "Full Blown Card Features" for example.'
        },
        image: {
            control: { type: 'text' },
            description: 'Optional - A valid image source to add to the card. It can be a remote url or a local path to an image.'
        },
        errorImage: {
            control: {  type: 'text'},
            description: 'Optional - A valid image source to add to the card in case the initial image does not load. Ideally a local path to make sure it loads. If none is provied, OxygenUI renders a default image placeholder for not found images.'
        },
        style: {
            control: { type: 'object' },
            description: 'Optional - The style prop exposed. It applies to the most outter wrapper of the card.',
            defaultValue: {
                width: 300,
                height: 300
            }
        },
        footer: {
            description: 'Optional - An inline declared or custom component that can receive props to be displayed as a footer.'
        }
	},
	decorators: [(Story) => <ThemeProvider>{Story()}</ThemeProvider>],
} as ComponentMeta<typeof Card>;

const Template: ComponentStory<typeof Card> = (args) => <Card {...args} />;

export const BasicCard = Template.bind({});
BasicCard.args = {
	title: 'Basic Card',
    description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Illum cum repudiandae adipisci! Beatae dolorem reprehenderit maiores officia, commodi perferendis, voluptatibus odit maxime distinctio quia, accusamus dignissimos ad optio ea pariatur.",
    elevationOnHover: false,
    style: {
        width: "200px",
        height: 'max-content',
    }
};

export const CardWithElevation = Template.bind({});
CardWithElevation.args = {
	title: 'With Elevation',
    description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Illum cum repudiandae adipisci! Beatae dolorem reprehenderit maiores officia, commodi perferendis, voluptatibus odit maxime distinctio quia, accusamus dignissimos ad optio ea pariatur.",
    elevationOnHover: true,
    style: {
        width: "200px",
        height: 'max-content',
    },
};


export const CardWithImage = Template.bind({});
CardWithImage.args = {
	elevationOnHover: true,
	title: '7 Days Trip To Japan',
    image: 'https://images.pexels.com/photos/356269/pexels-photo-356269.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia, deleniti quod in expedita unde fuga corporis magni ea illo iste vero sunt accusantium, quo, voluptas vitae sapiente consequuntur fugit. Suscipit, corporis? Asperiores obcaecati iusto tempore impedit repellendus voluptate optio ipsam!",
    style: {
        width: "300px",
        height: "300px"
    }
};


export const FullBlownCardFeatures = Template.bind({});
FullBlownCardFeatures.args = {
    elevationOnHover: true,
	title: '7 Days Trip To Japan',
    image: 'https://images.pexels.com/photos/356269/pexels-photo-356269.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: <div style={{ fontSize: 12 }}>
        <p>
            Kōchi-jō is one of just a dozen castles in Japan to have survived with its original tenshu-kaku (keep) intact. The castle was originally built during the first decade of the 17th century...
            <a style={{ color: 'royalblue', textDecoration: 'underline' }}>Read more</a>
        </p>
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <BiHotel fontSize={30}/>
                <AiFillStar color="goldenrod" fontSize={15}/>
                <AiFillStar color="goldenrod" fontSize={15}/>
                <AiFillStar color="goldenrod" fontSize={15}/>
                <AiFillStar color="goldenrod" fontSize={15}/>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <GiKnifeFork fontSize={20}/>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Breakfast <BsFillPatchCheckFill color="lightgreen"/></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Lunch <BsFillPatchCheckFill color="lightgreen"/></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Dinner <BsFillPatchCheckFill color="lightgreen"/></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <BsCurrencyDollar fontSize={23}/>
                <span style={{ display: 'flex', alignItems: 'center'}}>389 / day / <BsFillPersonFill fontSize={18}/> </span>
            </div>
        </div>
    </div>,
    footer: <div style={{ display: 'flex', gap: 10 }}>
        <Button
            icon={<BsFillCalendarCheckFill/>}
            type='primary'
            onClick={() => alert("Some prop passed to it from higher up")}
            content='Book Now'
            style={{ fontSize: 16, width: 250 }}
        />
    </div>,
    style: {
        width: "300px",
        height: "400px"
    }
};