import React, { CSSProperties, useEffect, useState } from 'react';
import { Button, IconButton } from '../buttons';
import { Badge } from '../badge';
import { AiOutlineShoppingCart } from 'react-icons/ai'
import { FaEuroSign } from "react-icons/fa";
import { CartButtonProps, CartContextProps, CartItemProps } from '../../types/cart';
import { useTheme } from '../../hooks';
import { IoBagCheckOutline } from "react-icons/io5";

const CartContext = React.createContext<CartContextProps<CartItemProps> | null>(null);

export const CartProvider = ({children}: { children: JSX.Element[] | JSX.Element }) => {
    const [cartItems, setCartItems] = React.useState<any[]>([]);
        
    function addToCart<T>(newItem: T): void {
        setCartItems((prev: T[]) => [...prev, newItem])
    }

    function removeFromCart<T>(itemKey: keyof T, itemValue: any): void {
        const findAll = cartItems.filter((item: T) => item[itemKey] === itemValue)
        if (findAll.length === 1) {
            setCartItems((prev: T[]) => {
                return prev.filter((item: T) => item[itemKey] !== itemValue)
            })
            return
        } 

        setCartItems((prev: T[]) => {
            const newValue = prev.slice();
            const lastIndexOf = newValue.findLastIndex((item: T) => item[itemKey] === itemValue);
            newValue.splice(lastIndexOf, 1)
            return newValue;
        })
    }

    function getUniqueCartItems<T>(itemKey: keyof T): T[] {
        const unique: T[] = [];
        const indexes: (T[keyof T])[] = [];
        cartItems.forEach((item: T) => {
            if (!indexes.includes(item[itemKey])) {
                indexes.push(item[itemKey])
                unique.push(item)
            }
        })
        return unique;
    }

    function getQuantityPerItem<T>(itemKey: keyof T, value: string | number): number {
        let quantity = 0;
        cartItems.forEach((item: T) => {
            if (item[itemKey] === value){
                quantity++;
            }
        })
        return quantity;
    }

    function getTotalPerItem<T>(itemKey: keyof T, itemKeyValue: string | number, amountKey: keyof T): number {
        let total = 0;
        
        cartItems.forEach((item: T) => {
            if (item[itemKey] === itemKeyValue){
                total += typeof item[amountKey] === 'string' ? parseFloat(item[amountKey] as string) : item[amountKey] as number
            }
        })
        return parseFloat(total.toFixed(2));
    }

    function getCartTotal<T>(priceKey: keyof T): number {
        
        return cartItems.length === 0 
            ? 0 
            : cartItems.reduce((total, curr) => {
                return total + curr[priceKey]
            }, 0)
    }

    function clearCart(): void {
        setCartItems([]);
    }

    function deleteFromCart<T>(itemKey: keyof T, itemValue: any): void {
        setCartItems((prev: T[]) => {
            return prev.filter((item: T) => item[itemKey] !== itemValue)
        })
    }

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            getUniqueCartItems,
            getQuantityPerItem,
            getTotalPerItem,
            getCartTotal,
            clearCart,
            deleteFromCart
        }}>
            {children}
        </CartContext.Provider>
    )
}

export const CartButton = ({
    icon = <AiOutlineShoppingCart/>,
    type = 'primary',
    badgeColor = 'white',
    badgeBackground = 'tomato',
    badgeShape = 'circle',
    badgePosition = 'topRight',
    priceUnitIcon = <FaEuroSign/>,
    itemUniqueKey = 'sku' as keyof CartItemProps,
    itemPriceKey = 'price' as keyof CartItemProps,
    cartHeader = 'My Cart',
    checkoutButtonText = 'Secure Checkout',
    checkoutButtonIcon = <IoBagCheckOutline fontSize={16}/>,
    onCheckout = () => {},
    CartItem,
    EmptyCartComponent = EmptyCart
}: CartButtonProps) => {
    const { theme } = useTheme();
    const { cartItems, getUniqueCartItems, getCartTotal } = useCart();
    const cartRef = React.useRef<HTMLDivElement>(null)
    const itemsRef = React.useRef<HTMLDivElement>(null)
    const [innerItems, setInnnerItems] = useState<any[] | null>(null)

    const oxyOnClick = () => {
        if (cartRef.current){
            let unique: any[] | null  = null;
            if (cartRef.current.classList.contains('oxyui__cart__popup__visible')){
                cartRef.current.classList.remove('oxyui__cart__popup__visible');
                cartRef.current.classList.add('oxyui__cart__popup__invisible');
                cartRef.current.ontransitionend = () => {
                    setInnnerItems(unique)
                }
            } else {
                cartRef.current.classList.remove('oxyui__cart__popup__invisible');
                cartRef.current.classList.add('oxyui__cart__popup__visible');
                
                unique = getUniqueCartItems<typeof CartItem>(itemUniqueKey as keyof CartItemProps);
                setInnnerItems(unique.length === 0 ? null : unique)
                
                cartRef.current.ontransitionend = (e) => {
                    if (e.target) {
                        return
                    }                        
                    if (itemsRef.current) {
                        itemsRef.current.scrollTo({ top: 450, behavior: 'smooth' })
                    }
                }
            }
        }
    }

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        const unique = getUniqueCartItems<typeof CartItem>(itemUniqueKey as keyof CartItemProps)
        if (innerItems && innerItems.length < unique.length) {
            timeout = setTimeout(() => {
                if (itemsRef.current) {
                    itemsRef.current.scrollTo({ top: 450, behavior: 'smooth' })
                }
            }, 400)
        }
        setInnnerItems(unique.length === 0 ? null : unique)

        return () => {
            if (timeout) {
                clearTimeout(timeout)
            }
        }
    }, [cartItems, itemUniqueKey, getUniqueCartItems])

    return (
        <div className='oxyui__cart'>
            <Badge
             color={badgeColor}
             background={badgeBackground}
             shape={badgeShape}
             position={badgePosition}
             content={cartItems.length}
            >
                <IconButton
                    type={type}
                    icon={icon}
                    onClick={oxyOnClick}
                />
            </Badge>
            <div ref={cartRef} className={`oxyui__cart__popup oxyui__cart__popup__${theme} oxyui__cart__popup__invisible`}>
                {cartHeader ? <h2 className='oxyui__cart__popup__header'>{cartHeader}</h2> : null}
                <div ref={itemsRef} className='oxyui__cart__popup__items__wrapper'>
                    {innerItems 
                    ? innerItems.map((cartItem: any, index: number) => (
                        <div key={index} className='oxyui__cart__item__wrapper' style={{ animationDelay: `${index * .1}s` }}>
                            <CartItem {...cartItem} unitSymbol={priceUnitIcon}/>
                        </div>
                    ))
                    : <EmptyCartComponent width='100%' height={200}/>
                    }
                </div>
                <div className='oxyui__cart__popup__footer'>
                    <div className='oxyui__cart_popup__footer__total'>
                        Total: {getCartTotal<CartItemProps>(itemPriceKey as keyof CartItemProps).toFixed(2)} {priceUnitIcon}
                    </div>
                    <Button
                        content={checkoutButtonText}
                        disabled={!innerItems}
                        type='primary'
                        onClick={onCheckout}
                        icon={checkoutButtonIcon}
                    />
                </div>
            </div>
        </div>
    )
}

export const useCart = () => {
    const cartCtx = React.useContext(CartContext);
    if (!cartCtx) throw new Error('[ERR:] CartProvider not found!');
    return cartCtx;
}

const EmptyCart = ({width, height}: CSSProperties) => (
    <div>
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" stroke="#1C274C" stroke-width="1.5"/>
            <path d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z" stroke="#1C274C" stroke-width="1.5"/>
            <path d="M2 3L2.26121 3.09184C3.5628 3.54945 4.2136 3.77826 4.58584 4.32298C4.95808 4.86771 4.95808 5.59126 4.95808 7.03836V9.76C4.95808 12.7016 5.02132 13.6723 5.88772 14.5862C6.75412 15.5 8.14857 15.5 10.9375 15.5H12M16.2404 15.5C17.8014 15.5 18.5819 15.5 19.1336 15.0504C19.6853 14.6008 19.8429 13.8364 20.158 12.3075L20.6578 9.88275C21.0049 8.14369 21.1784 7.27417 20.7345 6.69708C20.2906 6.12 18.7738 6.12 17.0888 6.12H11.0235M4.95808 6.12H7" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <h2 style={{textAlign: 'center'}}>Your cart is empty!</h2>
    </div>
)