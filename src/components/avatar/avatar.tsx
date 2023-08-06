import React from 'react';
import { AvatarProps } from "../../types/avatar";

const Avatar = (props: AvatarProps) => {
    const [hasError, setHasError] = React.useState<boolean>(false)
    const [initials, setInitials] = React.useState<string | null>(null)
    const color = props.mode === 'initials' ? props.color : props.mode === 'img' && props.fallback ? props.fallback.color : '';
    const backgroundColor = props.mode === 'initials' ? props.background : props.mode === 'img' && props.fallback ? props.fallback.background : '';


    const oxyOnError = () => setHasError(true)

    React.useEffect(() => {
        if (props.mode === 'initials') {
            setInitials(props.initials.substring(0,2))
        }
        if (props.mode === 'img' && props.fallback){
            setInitials(props.fallback.initials.substring(0,2))
        }
    }, [props.mode])
    

    return (
        <div className='oxyui__avatar__wrapper'>
            <div 
                className={`oxyui__avatar oxyui__avatar__${props.shape} oxyui__avatar__${props.size}`}
                style={{ backgroundColor, color }}
            >
                {
                    props.mode === 'initials' || hasError
                    ? <span>{initials}</span>
                    : <img onError={oxyOnError} src={props.imgSrc} className='oxyui__avatar__image'/>
                }
            </div>
            {
                props.badgeColor 
                ? <div className='oxyui__avatar__badge' style={{ backgroundColor: props.badgeColor }}/>
                : null
            }
        </div>
    )
}
export default Avatar;