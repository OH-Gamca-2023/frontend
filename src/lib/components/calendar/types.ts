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

    isBottom?: boolean
    selected?: boolean

    startCol?: number
    startRow?: number
}

export type CalendarProps = {
    id: string
    name: string
    description: string
}

export type CalendarEvent = {
    id: string
    name: string
    date: Date
    time: string
    location: string
    category: Category
    grades: Grade[]
}

export type CalendarData = CalendarProps & {
    events: CalendarEvent[]
}