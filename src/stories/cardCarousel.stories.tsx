import { ComponentMeta, ComponentStory } from '@storybook/react';
import { CardCarousel } from '../components/cardCarousel';
import ThemeProvider from '../context/themeContext';
import { Button } from '../components/buttons';
import { AiFillStar } from 'react-icons/ai';
import { BiHotel } from 'react-icons/bi';
import { GiKnifeFork } from 'react-icons/gi';
import { BsCurrencyDollar, BsFillPatchCheckFill, BsFillPersonFill, BsFillCalendarCheckFill } from 'react-icons/bs';

export default {
	title: 'Components/Data Display/Card Carousel',
	component: CardCarousel,
	tags: ['autodocs'],
	argTypes: {
       
	},
	decorators: [(Story) => <ThemeProvider>{Story()}</ThemeProvider>],
} as ComponentMeta<typeof CardCarousel>;

const Template: ComponentStory<typeof CardCarousel> = (args) => <CardCarousel {...args} />;

export const BasicCardCarousel = Template.bind({});
BasicCardCarousel.args = {
	cards: [
        {   
            key: '1',
            elevationOnHover: true,
            title: '7 Days Trip To Japan',
            image: 'https://images.pexels.com/photos/356269/pexels-photo-356269.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia, deleniti quod in expedita unde fuga corporis magni ea illo iste vero sunt accusantium, quo, voluptas vitae sapiente consequuntur fugit. Suscipit, corporis? Asperiores obcaecati iusto tempore impedit repellendus voluptate optio ipsam!",
            width: "300px",
            height: "300px"
        },
        {   
            key: '2',
            elevationOnHover: true,
            title: '8 Days Trip To Japan',
            image: 'https://images.pexels.com/photos/356269/pexels-photo-356269.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia, deleniti quod in expedita unde fuga corporis magni ea illo iste vero sunt accusantium, quo, voluptas vitae sapiente consequuntur fugit. Suscipit, corporis? Asperiores obcaecati iusto tempore impedit repellendus voluptate optio ipsam!",
            width: "300px",
            height: "300px"
        },
        {   
            key: '3',
            elevationOnHover: true,
            title: '9 Days Trip To Japan',
            image: 'https://images.pexels.com/photos/356269/pexels-photo-356269.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia, deleniti quod in expedita unde fuga corporis magni ea illo iste vero sunt accusantium, quo, voluptas vitae sapiente consequuntur fugit. Suscipit, corporis? Asperiores obcaecati iusto tempore impedit repellendus voluptate optio ipsam!",
            width: "300px",
            height: "300px"
        },
        {   
            key: '4',
            elevationOnHover: true,
            title: '10 Days Trip To Japan',
            image: 'https://images.pexels.com/photos/356269/pexels-photo-356269.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia, deleniti quod in expedita unde fuga corporis magni ea illo iste vero sunt accusantium, quo, voluptas vitae sapiente consequuntur fugit. Suscipit, corporis? Asperiores obcaecati iusto tempore impedit repellendus voluptate optio ipsam!",
            width: "300px",
            height: "300px"
        },
        {   
            key: '5',
            elevationOnHover: true,
            title: '11 Days Trip To Japan',
            image: 'https://images.pexels.com/photos/356269/pexels-photo-356269.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia, deleniti quod in expedita unde fuga corporis magni ea illo iste vero sunt accusantium, quo, voluptas vitae sapiente consequuntur fugit. Suscipit, corporis? Asperiores obcaecati iusto tempore impedit repellendus voluptate optio ipsam!",
            width: "300px",
            height: "300px"
        }
    ]
};

const Footer = ({onClick}: any) => {
    return (
        <div style={{ display: 'flex', gap: 10 }}>
            <Button
                icon={<BsFillCalendarCheckFill/>}
                type='primary'
                onClick={onClick}
                content='Book Now'
                style={{ fontSize: 16, width: 250 }}
            />
        </div>
    ) 
}

const Description = () => {
    return (
        <div style={{ fontSize: 12 }}>
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
        </div>
    )
}

export const CardCarouselWithFooter = Template.bind({})
CardCarouselWithFooter.args = {
    cards: [
        {
            key: 1,
            elevationOnHover: true,
            title: '7 Days Trip To Japan',
            image: 'https://images.pexels.com/photos/356269/pexels-photo-356269.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            description: <Description/>,
            footer: <Footer onClick={() => alert('7 days trip to Japan')}/>,
            style: {
                width: "300px",
                height: "400px"
            }
        },
        {
            key: 2,
            elevationOnHover: true,
            title: '8 Days Trip To Japan',
            image: 'https://images.pexels.com/photos/356269/pexels-photo-356269.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            description: <Description/>,
            footer: <Footer onClick={() => alert('8 days trip to Japan')}/>,
            style: {
                width: "300px",
                height: "400px"
            }
        },
        {
            key: 3,
            elevationOnHover: true,
            title: '9 Days Trip To Japan',
            image: 'https://images.pexels.com/photos/356269/pexels-photo-356269.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            description: <Description/>,
            footer: <Footer onClick={() => alert('9 days trip to Japan')}/>,
            style: {
                width: "300px",
                height: "400px"
            }
        },
        {
            key: 4,
            elevationOnHover: true,
            title: '10 Days Trip To Japan',
            image: 'https://images.pexels.com/photos/356269/pexels-photo-356269.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            description: <Description/>,
            footer: <Footer onClick={() => alert('10 days trip')}/>,
            style: {
                width: "300px",
                height: "400px"
            }
        }
    ]
}


