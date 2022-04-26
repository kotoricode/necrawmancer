export const clamp01 = (value: number) => Math.min(Math.max(0, value), 1)

export const getElement = <T extends HTMLElement>(selector: string) =>
{
    const element = document.querySelector<T>(selector)

    if (!element)
    {
        throw Error(`Missing element: ${selector}`)
    }

    return element
}
