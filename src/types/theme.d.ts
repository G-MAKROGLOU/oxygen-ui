export interface ThemeProps {
    theme: 'light' | 'dark';
    setMode: (isDarkMode: boolean) => void; 
}


export interface ThemeProviderProps {
    children?: JSX.Element
}