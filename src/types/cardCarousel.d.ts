import { CardProps } from "./card";
import { IconButtonProps } from "./iconButton"

export type CardCarouselProps = {
    leftControl: CardCarouselControl,
    rightControl: CardCarouselControl,
    cards: CardProps & {
        key: string | number
    }
}


export type CardCarouselControl = {
    icon: JSX.Element;
	type: AllButtonTypes;
}
