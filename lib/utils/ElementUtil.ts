export function closest(element: Element, query: string): Element {
    if (element && element.closest) {
        return element.closest(query);
    }

    // for IE11 and below
    while (element && !(element.matches || element.msMatchesSelector).call(element, query)) {
        element = element.parentElement;
    }

    return element;
}