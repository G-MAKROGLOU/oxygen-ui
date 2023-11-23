import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../hooks";
import { CardProps } from "../../types/card";

const Card = ({
    elevationOnHover = false,
    footer,
    title,
    description,
    image,
    errorImage = "./assets/image_not_available.png",
    style = {
        width: 300,
        height: 300
    }
}: CardProps) => {
    const { theme } = useTheme()

    const imgRef = useRef<HTMLDivElement>(null);
    

    useEffect(() => {
        if (image) {
            const img = new Image(0,0);
            img.src = image;
            img.onload = () => {
                if (imgRef.current){
                    imgRef.current.style.backgroundImage = `url("${image}")`
                }
            }
            img.onerror = () => {
                if (imgRef.current){
                    imgRef.current.style.backgroundImage = `url("${errorImage}")`
                }
            }
        }
    }, [imgRef, image])

    return (
        <div
            className={`oxyui__card oxyui__card__${theme} ${elevationOnHover ? 'oxyui__card__hover' : ''}`} 
            style={style} 
        >
            <div className={`oxyui__card_title ${image ? 'oxyui__card_title__with__image' : ''}`}>{title}</div>
            {
                image
                ? <div className='oxyui__card__image__wrapper'>
                    <div ref={imgRef} className='oxyui__card__image'/>
                    <div className='oxyui__card__image__shader'/>
                </div>
                : null
            }
            <div className='oxyui__card_description'>{description}</div>
            {
                footer 
                ? <div className='oxyui__card__actions'>
                    {footer}
                </div>
                : null
            }
        </div>
    )
}

export default Card;