import { Meta } from '@storybook/react';
import ThemeProvider from '../context/themeContext';
import { CartProvider, useCart } from '../components/cart';
import { Card } from '../components/card';
import { Button, IconButton } from '../components/buttons';
import { AiFillDelete, AiOutlineShoppingCart } from 'react-icons/ai'
import { CartButton } from '../components/cart/cart';
import { FaEuroSign, FaMinus, FaPlus  } from "react-icons/fa";
import { CartItemProps } from '../types/cart';
import { IoBagCheckOutline } from 'react-icons/io5';

// TODO: write complete docs of how to use the cart component along with the provider etc.

type Shoe = CartItemProps & {
    sku: number;
    img: string;
    size: string;
    brand: string;
    model: string;
    description: string;
    color: string;
    price: number;
}

export default {
	title: 'Components/Composed/Cart',
	component: CartProvider,
	tags: ['autodocs'],
	argTypes: {},
	decorators: [(Story) => <ThemeProvider>
        <CartProvider>
            {Story()}
        </CartProvider>
    </ThemeProvider>],
} as Meta<typeof CartProvider>;

export const BasicCart = ({}:any) => {
    const items: Shoe[] = [
        {
            sku: 1,
            img: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSTselfTVPamdXA6Wp_IrGxKIBx5VDkxzZMYAo8cznB-7l5i6duzKRJoVtX7CBPQiT2demWu1sOnhWepna38W0UEsHAmH1jja0ZviQKP0JOaq6GWlg7mDSiPX3bb1_L&usqp=CAc',
            size: '44',
            brand: 'Nike',
            model: 'Air Jordan 1',
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Earum voluptates reprehenderit perferendis distinctio eos pariatur corporis animi recusandae molestiae! Debitis id distinctio ea libero fugit, ab ullam maxime quibusdam consequatur?',
            color: 'red-black-white',
            price: 139.99
        },
        {
            sku: 2,
            img: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTH07Gf2sDHSwbq4D8jU0krFElJnsJGthnvJ0hRL-Qwmz7xAFEknDYnj1mJNiWUbjyKVliSq01LWwo7szrf6AmXfSazPH49EQimBjIQZa1mLARK1IzxErSvGpkNLhs&usqp=CAc',
            size: '44',
            brand: 'Nike',
            model: 'Jordan Max Aura 4',
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Earum voluptates reprehenderit perferendis distinctio eos pariatur corporis animi recusandae molestiae! Debitis id distinctio ea libero fugit, ab ullam maxime quibusdam consequatur?',
            color: 'white-red',
            price: 129.99
        },
        {
            sku: 3,
            img: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSC4FEXoyA3x0iYBInI8WWQF-KUbYKuBhem9oaFsxaj864yfAUd7YI9Rsbn0XFRwh_smY1XzFrjkoV3tddU9Sjq2KZnTqw1aLEoLK6ne3NwIrNvChhkU88uQeRXFtmi&usqp=CAc',
            size: '45',
            brand: 'Nike',
            model: 'Air Jordan 1 Hi FlyEase',
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Earum voluptates reprehenderit perferendis distinctio eos pariatur corporis animi recusandae molestiae! Debitis id distinctio ea libero fugit, ab ullam maxime quibusdam consequatur?',
            color: 'red-black',
            price: 119.99
        },
        {
            sku: 4,
            img: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcS84wO-mq2acb9k_6uS1Kk3WZLNQyxsbwW8SwXQ_o6JBlTLL6S_XGF7L3gpZxw40dncvPMG9haIAHhXLvU81FqpqHfgIesimb0yGqkniSatqZRo7o3i34iMqARYPfy_&usqp=CAc',
            size: '46',
            brand: 'Nike',
            model: 'Dunk High Retro',
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Earum voluptates reprehenderit perferendis distinctio eos pariatur corporis animi recusandae molestiae! Debitis id distinctio ea libero fugit, ab ullam maxime quibusdam consequatur?',
            color: 'cyan-white',
            price: 109.99
        },
        {
            sku: 5,
            img: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTPd1Pgaey2lbG4JbzF3Ps5btTsHNhNlptTx99iJ1SU2OvokloaucrfF8zhOKxPIOYvY45Gs9DE2EnTpqKMYyQK0ZC6vASrQuhFA-OTy8r5MtDfk5Ltr-5h4sFcn_Mv&usqp=CAc',
            size: '44',
            brand: 'Nike',
            model: 'Panda Dunk Low Retro',
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Earum voluptates reprehenderit perferendis distinctio eos pariatur corporis animi recusandae molestiae! Debitis id distinctio ea libero fugit, ab ullam maxime quibusdam consequatur?',
            color: 'black-white',
            price: 99.99
        }
    ]

    return (
        <div>
            <div style={{width: '90vw', height: 60, background: 'cyan', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0px 20px'}}>
                <CartButton
                    CartItem={ShoeCartCard}
                    badgeBackground="hotpink"
                    badgeColor="white"
                    badgeShape="rounded"
                    badgePosition="bottomRight"
                    priceUnitIcon={<FaEuroSign/>}
                    itemUniqueKey={"sku" as keyof Shoe}
                    itemPriceKey={"price" as keyof Shoe}
                    cartHeader="My Online Cart"
                    checkoutButtonText='Secure Checkout'
                    checkoutButtonIcon={<IoBagCheckOutline fontSize={16}/>}
                    onCheckout={() => alert("Redirecting you to checkout route...")}
                />
            </div>
            <div style={{width: '90vw', height: 60, display: 'flex', flexWrap: 'wrap', gap: 10, padding: '10px 10px'}}>
                {items.map((item: Shoe, index: number) => (
                    <ShoeCard 
                        key={index} 
                        shoe={item} 
                    />
                ))}
            </div>
        </div>
    )
}

const ShoeCard = ({ shoe }: { shoe: Shoe }) => {
    const { addToCart } = useCart();

    return (
        <Card
            style={{
                width: 300,
                height: 400
            }}
            elevationOnHover={true}
            title={`${shoe.brand} ${shoe.model}`}
            description={shoe.description}
            image={shoe.img}
            footer={
                <div>
                    <Button
                        type='primary'
                        content='Add to Cart'
                        icon={<AiOutlineShoppingCart/>}
                        onClick={() => addToCart(shoe)}
                    />
                </div>
            }
        />
    )
}

type ShoeCartCardType = Shoe & {
    unitSymbol: JSX.Element
}

const ShoeCartCard = ({unitSymbol, ...shoe}: ShoeCartCardType) => {
    
    const {
        getQuantityPerItem,
        getTotalPerItem,
        addToCart,
        removeFromCart,
        deleteFromCart
    } = useCart();

    return (
        <div 
            style={{
                height: 120,
                width: '100%',
                borderRadius: 2,
                boxShadow: '0px 0px 2px 0px rgba(0,0,0,.5)',
                display: 'flex',
                padding: 5,
                gap: 5,
                flexGrow: 1
            }}
        >
            <img src={shoe.img} style={{width: 80, height: 80}}/>
            <div style={{fontWeight: 'bolder', fontSize: 12, width: '100%'}}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'flex-start', justifyContent: 'space-between'}}>
                    <div style={{ fontSize: 16 }}>Model: {shoe.brand} {shoe.model}</div>
                    <IconButton icon={<AiFillDelete fontSize={18} color='tomato'/>} onClick={() => deleteFromCart('sku', shoe.sku)} type="link"/>
                </div>
                
                <div>Color: {shoe.color}</div>
                <div style={{display: 'flex', alignItems: 'center'}}>Price: {shoe.price} {unitSymbol}</div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'space-between'}}>
                    <div>
                        <div>
                            Quantity: x {getQuantityPerItem<Shoe>('sku', shoe.sku)}
                        </div>
                        <div style={{display: 'flex', alignItems: 'center'}}>Total: {getTotalPerItem<Shoe>('sku', shoe.sku, 'price')} {unitSymbol}</div>
                    </div>
                    <div style={{display: 'flex', gap: 5}}>
                        <IconButton icon={<FaMinus fontSize={8}/>} onClick={() => removeFromCart('sku', shoe.sku)} type="secondary"/>
                        <IconButton icon={<FaPlus fontSize={8}/>} onClick={() => addToCart(shoe)}  type="primary"/>
                    </div>
                </div>
            </div>
        </div>
    )
}