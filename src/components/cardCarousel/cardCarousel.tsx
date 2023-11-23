import { useState, useEffect } from "react";
import { IconButton } from "../buttons";
import {
	BsFillCaretLeftFill,
	BsFillCaretRightFill,
} from 'react-icons/bs';
import Card from "../card/card";
import { useTheme } from "../../hooks";

const CardCarousel = ({
    leftControl = {
        type: 'primary',
        icon: <BsFillCaretLeftFill fontSize={18}/>
    },
    rightControl = {
        type: 'primary',
        icon: <BsFillCaretRightFill fontSize={18}/>
    },
    cards,
}: any) => {
    const { theme } = useTheme();
    const [offset, setOffset] = useState(0)
    const [toShow, setToShow] = useState<any>([])
    const [inactiveClass, setInactiveClass] = useState('toRight')

    useEffect(() => {
        if (cards.length <= 3){
            throw new Error('The card carousel component must have at least four cards to function properly! If you just have three cards to show, consider using the card pricing layout instead.')
        }
        let cardsToShow = [];
        for (let i = offset; i < 3+offset; i++) {
            if (i > cards.length-1){
                cardsToShow.push(cards[i - cards.length])
            }else{
                cardsToShow.push(cards[i])
            }
        }
        setToShow(cardsToShow)
      
    }, [cards, offset])
    
    const oxyOnLeftControlClick = () => {
        setInactiveClass('toLeft')
        if (offset + 1 > cards.length-1) {
            setOffset(0)
            return
        }
        setOffset(offset+1)
    }

    const oxyOnRightControlClick = () => {
        setInactiveClass('toRight')
         if (offset - 1 < 0){
            setOffset(cards.length - 1)
            return
        }
        setOffset(offset-1)
    }

    


    const getRefs = (index: number, ref: HTMLDivElement | null): void => {
       if (ref){
            ref.classList.remove('oxyui__cardCarousel__card__active', 'oxyui__cardCarousel__card__active__toRight', 'oxyui__cardCarousel__card__active__toLeft', 'oxyui__cardCarousel__card__inactive__toRight', 'oxyui__cardCarousel__card__inactive__toLeft')
            if (index === 1){
                ref.classList.add(`oxyui__cardCarousel__card__active__${inactiveClass}`)
            }else {
                ref.classList.add(`oxyui__cardCarousel__card__inactive__${inactiveClass}`)
            }
       }
    }

    return (
        <div className='oxyui__cardCarousel'>
            <IconButton
                type={leftControl.type}
                icon={leftControl.icon}
                onClick={oxyOnLeftControlClick}
            />
            <div className='oxyui__cardCarousel__cards__wrapper'>
                {
                    toShow
                    .map((card: any, index: number) => (
                        <div 
                            ref={ref => getRefs(index, ref)}
                            key={card.key}
                            className='oxyui__cardCarousel__card'
                        >
                            <Card {...card}/>
                        </div>
                    ))
                }
            </div>
            <IconButton
                type={rightControl.type}
                icon={rightControl.icon}
                onClick={oxyOnRightControlClick}
            />
        </div>
    )
}

export default CardCarousel;