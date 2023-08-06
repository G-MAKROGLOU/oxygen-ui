import React from 'react';
import { ButtonGroupProps, ButtonPart } from "../../types/buttonGroup";
import { useTheme } from '../../hooks';

/**
 * A button component with different variants to implement click events
 */
const ButtonGroup = ({
    buttons,
    onClick,
    defaultKey
}: ButtonGroupProps) => {
    const { theme } = useTheme()
    const [active, setActive] = React.useState(defaultKey)

    const oxyOnClick = (newKey: string | number) => {
        setActive(newKey)
        onClick(newKey)
    }

    return (
        <div>
            {
                buttons.map((button: ButtonPart, index: number) => {
                    const baseClass = `oxyui__buttongroup oxyui__button__${theme}__${button.type} ${active === button.key ? '' : 'oxyui__buttongroup__inactive'}` 
                    const className = index === 0 
                                      ? 'oxyui__buttongroup__start' 
                                      : index === buttons.length - 1 
                                      ? 'oxyui__buttongroup__end' 
                                      : 'oxyui__buttongroup__middle'
                    return (
                        <button className={`${baseClass} ${className}`} key={button.key} onClick={() => oxyOnClick(button.key)}>
                            {
                                button.icon
                                ? <span className='oxyui__buttongroup__icon'>{button.icon}</span>
                                : null
                            }
                            {
                                button.content 
                                ? <span className='oxyui__buttongroup__content'>{button.content}</span>
                                : null
                            }
                        </button>
                    )
                })
            }
        </div>
    )
}


export default ButtonGroup;