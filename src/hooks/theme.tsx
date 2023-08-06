import React from "react";
import { ThemeContext } from "../context/themeContext";

const useTheme = () => {
    const themeCtx = React.useContext(ThemeContext);
    if (!themeCtx) throw new Error('No Theme Context Provider found!');
    return themeCtx;
}

export default useTheme;