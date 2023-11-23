import { AllButtonTypes, Positions, Shapes } from "./misc";

export interface CartContextProps<T extends CartItemProps> {
    cartItems: I[];
    addToCart: <I>(newItem: I) => void;
    removeFromCart: <I>(itemKey: keyof I, itemValue: any) => void;
    getUniqueCartItems: <I>(itemKey: keyof I) => I[]; 
    getQuantityPerItem: <I>(itemKey: keyof I, value: string | number) => number;
    getTotalPerItem: <I>(itemKey: keyof I, itemKeyValue: string | number, amountKey: keyof I) => number
    getCartTotal: <I>(priceKey: keyof I) => number;
    clearCart: () => void;
    deleteFromCart: <T>(itemKey: keyof T, itemValue: any) => void;
}

export interface CartButtonProps {
    icon?: JSX.Element;
    type?: AllButtonTypes;
    badgeColor?: string;
    badgeBackground?: string;
    badgeShape?: Shapes,
    badgePosition?: Positions,
    priceUnitIcon?: JSX.Element;
    itemUniqueKey: string;
    itemPriceKey: string;
    cartHeader?: string;
    checkoutButtonText?: string;
    checkoutButtonIcon?: JSX.Element;
    onCheckout?: () => void;
    CartItem:  ({...rest}: any) => JSX.Element;
    EmptyCartComponent?: ({...rest}: CSSProperties) => JSX.Element;
}

export type CartItemProps = {};