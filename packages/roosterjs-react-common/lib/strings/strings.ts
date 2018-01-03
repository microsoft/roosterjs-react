export type Strings = { [key: string]: string };

let defaultStrings: { [category: string]: Strings } = {};

export function registerDefaultString(category: string, strings: Strings) {
    defaultStrings[category] = strings;
}

export function getString(category: string, name: string, strings?: Strings): string {
    let str = (strings || {})[name];
    if (str == null) {
        str = defaultStrings[category][name];
    }
    return str;
}
