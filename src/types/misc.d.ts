export type StringWildCardType = {
    [key: string]: string
}


export type NumberWildCardType = {
    [key: string]: number
}


export type DynamicWildCardType = {
    [key: string]: any
}

export type AllButtonTypes = 'primary' | 'secondary' | 'outlined' | 'link' | 'info' | 'success' | 'warning' | 'danger';

export type BasicButtonTypes = Exclude<AllButtonTypes, 'outlined' | 'link'>

export type RefMap = {
    key: string | number;
    ref: HTMLElement | null;
}

export type Sizes = 'sm' | 'md' | 'lg' | 'xl';

export type Shapes = 'circle' | 'rounded' | 'square';

export type Positions = 'bottomRight' | 'topRight' | 'topLeft' | 'bottomLeft';