const CssHandlers = {
    object: (obj: any, result: string[]) => {
        for (const key in obj) {
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

    return result.join(' ');
}

function reduceObject<T>(object: any, callback: (key: string) => boolean): T {
    if (!object) {
        return object;
    }

    return Object.keys(object).reduce(
        (result: T, key: string) => {
            if (callback(key)) {
                result[key] = object[key];
            }
            return result;
        },
        {} as T
    );
}

export function getDataAndAriaProps<T>(props: any): T {
    return reduceObject(props || {}, propName => propName.indexOf('data-') === 0 || propName.indexOf('aria-') === 0);
}
