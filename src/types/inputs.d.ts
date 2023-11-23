import { ChangeEvent } from "react";
import { Shapes } from "./misc";




export interface ColorPickerProps {
    colors: string[];
    value: string;
    previewProperty?: 'color' | 'backgroundColor'
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    swatchSize: number;
    swatchShape: Shapes;
    colorPickerRight?: boolean;
    children?: JSX.Element | JSX.Element | null;
}