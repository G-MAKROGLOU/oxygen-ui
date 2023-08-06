import { BasicButtonTypes } from "./misc";

export type MenuButtonProps = {
    mainButtonContent: string;
    mainButtonIcon?: JSX.Element;
    mainButtonType: BasicButtonTypes;
    secondaryButtonType: BasicButtonTypes;
    secondaryButtonIcon?: JSX.Element;
    menuItems: MenuButtonItem[];
    onClick: (isMainButton: boolean, secondaryButtonKey?: string | number) => void;
}

export type MenuButtonItem = {
    key: string | number;
    label?: string;
    divider?: boolean;
    icon?: JSX.Element;
}