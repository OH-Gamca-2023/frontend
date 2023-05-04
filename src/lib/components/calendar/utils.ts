
export function compareDates(a: Date, b: Date): boolean {
    // check if the dates are in the same month and are the same day
    return a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}