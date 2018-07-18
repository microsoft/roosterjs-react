export interface ColorInfo {
    key: string;
    title: string;
    color: string;
    cellBorderColor?: string;
}

export const FontColorInfoList = [
    { title: "Light Blue", color: "#51a7f9" },
    { title: "Light Green", color: "#6fc040" },
    { title: "Light Yellow", color: "#f5d427" },
    { title: "Light Orange", color: "#f3901d" },
    { title: "Light Red", color: "#ed5c57" },
    { title: "Light Purple", color: "#b36ae2" },
    { title: "Blue", color: "#0c64c0" },
    { title: "Green", color: "#0c882a" },
    { title: "Yellow", color: "#dcbe22" },
    { title: "Orange", color: "#de6a19" },
    { title: "Red", color: "#c82613" },
    { title: "Purple", color: "#763e9b" },
    { title: "Dark Blue", color: "#174e86" },
    { title: "Dark Green", color: "#0f5c1a" },
    { title: "Dark Yellow", color: "#c3971d" },
    { title: "Dark Orange", color: "#be5b17" },
    { title: "Dark Red", color: "#861106" },
    { title: "Dark Purple", color: "#5e327c" },
    { title: "Darker Blue", color: "#002451" },
    { title: "Darker Green", color: "#06400c" },
    { title: "Darker Yellow", color: "#a37519" },
    { title: "Darker Orange", color: "#934511" },
    { title: "Darker Red", color: "#570606" },
    { title: "Darker Purple", color: "#3b204d" },
    { title: "White", color: "#ffffff", cellBorderColor: "#bebebe" },
    { title: "Light Gray", color: "#cccccc" },
    { title: "Gray", color: "#999999" },
    { title: "Dark Gray", color: "#666666" },
    { title: "Darker Gray", color: "#333333" },
    { title: "Black", color: "#000000" },
] as ColorInfo[];

export const HighlightColorInfoList = [
    { title: "Cyan", color: "#00ffff" },
    { title: "Green", color: "#00ff00" },
    { title: "Yellow", color: "#ffff00" },
    { title: "Orange", color: "#ff8000" },
    { title: "Red", color: "#ff0000" },
    { title: "Magenta", color: "#ff00ff" },
    { title: "Light Cyan", color: "#80ffff" },
    { title: "Light Green", color: "#80ff80" },
    { title: "Light Yellow", color: "#ffff80" },
    { title: "Light Orange", color: "#ffc080" },
    { title: "Light Red", color: "#ff8080" },
    { title: "Light Magenta", color: "#ff80ff" },
    { title: "White", color: "#ffffff", cellBorderColor: "#bebebe" },
    { title: "Light Gray", color: "#cccccc" },
    { title: "Gray", color: "#999999" },
    { title: "Dark Gray", color: "#666666" },
    { title: "Darker Gray", color: "#333333" },
    { title: "Black", color: "#000000" },
] as ColorInfo[];

function _setKey(prefix: string, color: ColorInfo): void {
    const { title } = color;
    color.key = `${prefix}${title.replace(/\s/g, "")}`;
}

FontColorInfoList.forEach(_setKey.bind(this, "fontColor"));
HighlightColorInfoList.forEach(_setKey.bind(this, "highlight"));
