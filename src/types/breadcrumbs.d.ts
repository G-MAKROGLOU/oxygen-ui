
export type BreadcrumbsProps = {
    items: BreadcrumbItem[];
    asLinks?: boolean;
    onClick?: (clickedKey: string | number) => void;
    separator?: JSX.Element;
    activeKey: string | number;
}

export type BreadcrumbItem = {
    key: string | number;
    value: string;
    icon?: JSX.Element;
}