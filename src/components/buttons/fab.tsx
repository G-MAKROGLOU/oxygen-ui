import React from "react";
import { useTheme } from "../../hooks";
import { FABProps } from "../../types/fab";
import ScalarOpacityTransition from "../transition/opacityTransition";


const FAB = (props: FABProps) => {
    const {theme} = useTheme()
    const [rolloutVisible, setRolloutVisible] = React.useState(false);
    const rolloutRef = React.useRef<HTMLButtonElement>(null);
    const rolloutWrapperRef = React.useRef<HTMLDivElement>(null);

    const oxyOnClick = () => setRolloutVisible(!rolloutVisible)


    const oxyRolloutItemOnClick = (key: string | number) => {
        props.onClick(key)
        setRolloutVisible(false)
    }

    React.useEffect(() => {
        const clickAway = (e: MouseEvent) => {
            const target = e.target as Node
            if(
                rolloutRef.current && !rolloutRef.current.contains(target) &&
                rolloutWrapperRef.current && !rolloutWrapperRef.current.contains(target)
            ) {
                setRolloutVisible(false)
            }
        }

        document.addEventListener('mousedown', clickAway)

        return () => document.removeEventListener('mousedown', clickAway)
    }, [])


    if (props.mode === 'rollout') {
        return (
            <div ref={rolloutWrapperRef} className={`oxyui__rollout__fab__wrapper oxyui__fab__${props.position}`}>
                {
                    rolloutVisible
                    ? props.items.map((item, i) => (
                            <ScalarOpacityTransition 
                                delay={50} 
                                counter={props.items.length - i} 
                                key={item.key}
                            >
                                <button 
                                    className={`oxyui__fab oxyui__fab__${theme}__${item.type}`} 
                                    type="button"
                                    onClick={() => oxyRolloutItemOnClick(item.key)}
                                    disabled={item.disabled}
                                >
                                    {item.icon}
                                </button>
                            </ScalarOpacityTransition>
                        ))
                    : null
                }
                <button 
                    ref={rolloutRef}
                    className={`oxyui__fab oxyui__fab__${theme}__${props.type}`} 
                    type="button"
                    style={props.style}
                    onClick={oxyOnClick}
                    disabled={props.disabled}
                >
                    {props.icon}
                </button>
            </div>
        )
    }

    return (
        <button 
            className={`oxyui__fab oxyui__single_fab oxyui__fab__${theme}__${props.type} oxyui__fab__${props.position}`} 
            type="button"
            style={props.style}
            onClick={props.onClick}
            disabled={props.disabled}
        >
            {props.icon}
        </button>
    )
}

export default FAB;