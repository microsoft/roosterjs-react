const CssHandlers = {
    object: (obj: any, result: string[]) => {
        for (const key of obj) {
            if (obj[key]) {
                result.push(key);
            }
        }
    },
    string: (str: string, result: string[]) => result.push(str)
};

export function css(...args: (string | any)[]): string {
    const result: string[] = [];
    for (const arg of args) {
        const handler = CssHandlers[typeof arg];
        if (arg && handler) {
            handler(arg, result);
        }
    }

    return result.join(" ");
}
