import { settings, type Settings } from "$lib/data/settings"
import { get, readable } from "svelte/store"

export type ConsoleLogEntry = {
    type: 'debug' | 'info' | 'log' | 'warn' | 'error'
    message: string
    time: number
}
type ConsoleLog = ConsoleLogEntry[]

const consoleLog: ConsoleLog = []
let consoleLogUpdate: (value: ConsoleLog) => void = () => {}
export const consoleLogReadable = readable(consoleLog, (set) => {
    consoleLogUpdate = set
    return () => {
        consoleLogUpdate = () => {
            return
        }
    }
});

export function consoleLogAdd(type: ConsoleLogEntry['type'], message: ConsoleLogEntry['message']) {
    consoleLog.push({ type, message, time: Date.now() })
    consoleLogUpdate(consoleLog)
}

export function consoleLogClear() {
    consoleLog.splice(0, consoleLog.length)
    consoleLogUpdate(consoleLog)
}

const originalFunctions = {
    debug: console.debug,
    info: console.info,
    log: console.log,
    warn: console.warn,
    error: console.error,
}
let windowListener: any = null
let windowUnhandledListener: any = null
let enabled = false

const handler: (value: Settings) => void = ($settings) => {
    if(enabled && !$settings.debugMode.value) {
        console.debug = originalFunctions.debug
        console.info = originalFunctions.info
        console.log = originalFunctions.log
        console.warn = originalFunctions.warn
        console.error = originalFunctions.error
        enabled = false
        if(windowListener) {
            window.removeEventListener('error', windowListener)
            windowListener = null
        }
        if(windowUnhandledListener) {
            window.removeEventListener('unhandledrejection', windowUnhandledListener)
            windowUnhandledListener = null
        }
    } else if(!enabled && $settings.debugMode.value) {
        console.debug = (...args: any[]) => {
            originalFunctions.debug(...args)
            consoleLogAdd('debug', args.join(' '))
        }
        console.info = (...args: any[]) => {
            originalFunctions.info(...args)
            consoleLogAdd('info', args.join(' '))
        }
        console.log = (...args: any[]) => {
            originalFunctions.log(...args)
            consoleLogAdd('log', args.join(' '))
        }
        console.warn = (...args: any[]) => {
            originalFunctions.warn(...args)
            consoleLogAdd('warn', args.join(' '))
        }
        console.error = (...args: any[]) => {
            originalFunctions.error(...args)
            consoleLogAdd('error', args.join(' '))
        }
        enabled = true
        if(!windowListener) {
            windowListener = (event: ErrorEvent) => {
                consoleLogAdd('error', event.message)
            }
            window.addEventListener('error', windowListener)
        }
        if(!windowUnhandledListener) {
            windowUnhandledListener = (event: PromiseRejectionEvent) => {
                consoleLogAdd('error', event.reason)
            }
            window.addEventListener('unhandledrejection', windowUnhandledListener)
        }
    }
}

settings.subscribe(handler)
handler(get(settings))


export default consoleLogReadable