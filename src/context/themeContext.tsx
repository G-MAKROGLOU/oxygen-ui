import React, { useEffect, useState } from "react"
import { ThemeProps, ThemeProviderProps } from "../types/theme"

export const ThemeContext = React.createContext<ThemeProps | undefined>(undefined)

const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const localStorageMode = localStorage.getItem('mode');
        if (localStorageMode) {
            setMode(localStorageMode === 'dark')
        }
        if(!localStorageMode) {
            setMode(false)
        }
    }, [])

    const setMode = (isDarkMode: boolean) => {
        if(isDarkMode) {
            document.body.classList.add('dark')
            setTheme('dark');
        }
        if(!isDarkMode) {
            document.body.classList.remove('dark')
            setTheme('light');
        }
        
    }

    return <ThemeContext.Provider value={{
        theme,
        setMode
    }}>
        {children}
    </ThemeContext.Provider>
}

export default ThemeProvider;