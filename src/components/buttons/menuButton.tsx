import React from 'react'
import { AiFillCaretDown  } from 'react-icons/ai'
import ScalarOpacityTransition from '../transition/opacityTransition'
import { useTheme } from '../../hooks'
import { MenuButtonProps } from '../../types/menuButton'

const MenuButton = ({
    mainButtonContent,
    mainButtonType,
    mainButtonIcon,
    secondaryButtonType,
    secondaryButtonIcon,
    menuItems,
    onClick
}: MenuButtonProps) => {
    const [ itemsVisible, setItemsVisible ] = React.useState(false)
    const itemsRef = React.useRef<HTMLDivElement>(null)
    const { theme } = useTheme()

    React.useEffect(() => {
        const clickAway = (e: MouseEvent) => {
            const target = e.target as Node
            if (itemsRef.current && !itemsRef.current.contains(target)){
                setItemsVisible(false)
            }
        }
        document.addEventListener('mousedown', clickAway)

        return () => document.removeEventListener('mousedown', clickAway)
    }, [])


    const oxyOnClick = (isMain: boolean, secondaryKey?: string | number) => {
        onClick(isMain, secondaryKey);
        if (!isMain) setItemsVisible(false)
    }

    return (
        <div className='oxyui__menubutton__wrapper'>
            <div className={`oxyui__menubutton`}>
            <button onClick={() => oxyOnClick(true)} className={`oxyui__menubutton__main oxyui__menubutton__${theme}__${mainButtonType}`}>
                {mainButtonIcon ? mainButtonIcon : null}
                <span>{mainButtonContent}</span>
            </button>
            <button
                onClick={() => setItemsVisible(!itemsVisible)} 
                className={`oxyui__menubutton__secondary oxyui__menubutton__${theme}__${secondaryButtonType}`}
            >
                {secondaryButtonIcon ? secondaryButtonIcon : <AiFillCaretDown fontSize={15}/>}
            </button>
            </div>
            {
                itemsVisible
                ?  <ScalarOpacityTransition delay={0} counter={0}>
                    <div ref={itemsRef} className='oxyui__menubutton__items__wrapper'>
                        {
                            menuItems.map((item, i) => {
                                return item.divider 
                                ? <div 
                                    key={item.key} 
                                    className={`oxyui__menubutton__item__divider`}
                                  />
                                : <div 
                                    key={item.key} 
                                    onClick={() => oxyOnClick(false, item.key)}
                                    className={`oxyui__menubutton__item oxyui__menubutton__item__${i === 0 ? 'first' : i === menuItems.length - 1 ? 'last' : ''}`}
                                >
                                    {item.icon ? item.icon :  null}
                                    <span>{item.label}</span>
                                </div>
                            })
                        }
                    </div>
                </ScalarOpacityTransition>
                : null
            }
           
        </div>
    )
}


export default MenuButton;