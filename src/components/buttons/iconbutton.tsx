import { useTheme } from "../../hooks";
import { IconButtonProps } from "../../types/iconButton";

const IconButton = ({
    icon,
    onClick,
    type,
    loading,
    loadingIcon,
    disabled,
    style
}: IconButtonProps) => {
    const {theme} = useTheme()

    return (
        <button
            style={style}
            className={`oxyui__iconButton oxyui__iconButton__${theme}__${type}`}
            onClick={onClick}
            disabled={loading || disabled}
        >
            
            <span 
                className={loading ? 'oxyui__button__spinner' : ''}
            >
                {
                    loading 
                    ? loadingIcon ? <span className='oxyui__button__custom_spinner'>{loadingIcon}</span> : <div className='oxyui__default__button__spinner'/>
                    : <span className='oxyui__button_icon'>{icon}</span>
                }
            </span>
        </button>
    )
}


export default IconButton;