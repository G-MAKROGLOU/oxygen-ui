import { CSSProperties } from "react";
import { AllButtonTypes } from "./misc";

export type CardProps = {
    elevationOnHover: boolean;
    footer?: JSX.Element;
    title: string | JSX.Element;
    description?: string | JSX.Element;
    image?: string;
    errorImage?: string;
    style: CSSProperties;
}
