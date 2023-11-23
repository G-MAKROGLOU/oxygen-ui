import { useEffect, useRef } from "react";
import { ColorPickerProps } from "../../types/inputs";
import { useTheme } from "../../hooks";


export default function ColorPicker({
    colors,
    onChange,
    swatchSize,
    swatchShape,
    previewProperty,
    children,
    value,
    colorPickerRight
}: ColorPickerProps) {
    const { theme } = useTheme();
    const popupRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        // click away listener here
    }, [])


    const oxyOnClick = () => {
        if (popupRef.current){
            if (popupRef.current.classList.contains('oxyui__inputs__colorpicker__popup__invisible')){
                
                popupRef.current.classList.remove('oxyui__inputs__colorpicker__popup__invisible');
                popupRef.current.classList.add('oxyui__inputs__colorpicker__popup__visible');
                popupRef.current.ontransitionend = () => {
                
                }

            } else {
                popupRef.current.classList.remove('oxyui__inputs__colorpicker__popup__visible');
                popupRef.current.classList.add('oxyui__inputs__colorpicker__popup__invisible');
                popupRef.current.ontransitionend = (e) => {
                   
                }
            }
        }
    }

    return (
        <div className="oxyui__inputs__colorpicker">
            <div 
                className={`oxyui__inputs__colorpicker__value oxyui__inputs__colorpicker__value__${swatchShape}`} 
                style={{ width: swatchSize, height: swatchSize, backgroundColor: value }}
                onClick={oxyOnClick}
            />
            <div ref={popupRef} className={`oxyui__inputs__colorpicker__popup oxyui__inputs__colorpicker__popup__invisible oxyui__inputs__colorpicker__popup__${theme}`}>
                <div className='oxyui__inputs__colorpicker__swatch__wrapper'>
                    {colors.map(color => (
                        <div 
                            style={{ width: swatchSize, height: swatchSize, backgroundColor: color }} 
                            className={`oxyui__inputs__colorpicker__swatch oxyui__inputs__colorpicker__swatch__${theme} oxyui__inputs__colorpicker__swatch__${swatchShape}`}
                        />
                    ))}
                </div>
                {
                    children && previewProperty
                    ? <div style={{ [previewProperty]: value }}>
                        {children}
                    </div>
                    : null
                }
            </div>
            {children}
        </div>
    );
}