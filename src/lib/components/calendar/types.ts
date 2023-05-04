import type { Category, Grade } from "$lib/types"

export type Header = {
    name: string
    shortName: string
}

export type Day = {
    name: string
    enabled: boolean
    date: Date

    selected?: boolean
    today?: boolean
}

export type Item = {
    title: string
    className: string
    date: Date
    id: string

    selected?: boolean
}

export type CalendarProps = {
    id: string
    name: string
    description: string
}

export type CalendarEvent = {
    id: string
    name: {
        regular: string
        short: string
    }
    date: Date
    time: string
    location: string
    category: Category
    grades: Grade[]
}

export type CalendarData = CalendarProps & {
    events: CalendarEvent[]
}