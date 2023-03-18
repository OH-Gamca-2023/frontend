import { toasts } from 'svelte-toasts'


export type ToastOptions = {
    title: string
    message?: string
    duration?: number
    placement?: 'top-left' | 'top-center' | 'top' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom' | 'bottom-right' | 'center-center' | 'center'
    type: 'success' | 'error' | 'warning' | 'info'
    theme?: 'light' | 'dark' | 'auto'
    showProgress?: boolean
}

export function toast(options: ToastOptions, onClick?: () => void, onRemove?: () => void) {
    let placement: string = options.placement || 'bottom-right'
    if(!placement.includes('-')) placement = placement + '-center'

    const toastProps = {
        title: options.title,
        description: options.message || '',
        duration: options.duration || 0,
        placement: placement as 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center-center',
        type: options.type,
        theme: 'dark' as 'light' | 'dark', // TODO: Hardcoded to dark until proper light footer background is implemented
        // theme: ((options.theme || 'auto') === 'auto' ? getPrefValue('theme') : options.theme) as 'light' | 'dark',
        showProgress: options.showProgress || true,
        onClick,
        onRemove
    }

    toasts.add(toastProps)
}
