import { getApiHost } from '$lib/api/data'
import { toast } from '$lib/utils/toasts'
import { get } from 'svelte/store'
import { getAccessToken } from './state/token'

type Check = {
	time: number
	server: boolean
	internet: boolean
	status: string
	response: {
		status: string
		time: string
		token: {
			present: boolean
			found?: boolean
			valid?: boolean
			expires?: string
			expired?: boolean
			user?: {
				id: number
				username: string
				email: string
				type: 'student' | 'teacher' | 'alumni' | 'organizer' | 'admin'
			}
		}
	}
}

let consecutiveFailures = 0
let previousCheck: Check | undefined = undefined
const lastCheck = {
	time: -1,
	server: false,
	internet: false,
	status: '00', // 00 = offline, 01 = internet, 10 = server, 11 = online (10 should never happen)
	response: {
		status: 'error',
		time: '',
		token: {
			present: false,
		},
	},
} as Check

let errorToast: any = undefined
let waitingCheck: any = undefined

const reconnectListeners: (() => void)[] = []
const disconnectListeners: (() => void)[] = []

export function addReconnectListener(listener: () => void) {
	reconnectListeners.push(listener)
}

export function addDisconnectListener(listener: () => void) {
	disconnectListeners.push(listener)
}

async function runCheck() {
	const now = Date.now()
	try {
		const headers: any = {}

		if (getAccessToken()) headers['Authorization'] = 'Bearer ' + getAccessToken()

		const serverResult = await fetch(getApiHost() + '/status/', { method: 'GET', headers })
		if (serverResult.status === 200) {
			lastCheck.server = true
		} else {
			lastCheck.server = false
		}
		lastCheck.response = await serverResult.json()
	} catch (e) {
		lastCheck.server = false
		lastCheck.response = {
			status: 'error',
			time: '',
			token: {
				present: false,
			},
		}
	}
	lastCheck.internet = navigator.onLine
	lastCheck.status = (lastCheck.server ? '1' : '0') + (lastCheck.internet ? '1' : '0')
	lastCheck.time = now
	processCheckResult()
}

async function processCheckResult() {
	let nextCheck = 60000
	if (lastCheck.status === '00') {
		if (previousCheck === undefined) {
			// Internet and server are offline, no previous check
			errorToast?.remove()
			errorToast = toast({
				title: 'Nemáte internetové spojenie',
				message: 'Skontrolujte prosím vaše pripojenie k internetu',
				type: 'error',
			})
			nextCheck = 3000
		} else if (previousCheck.status !== '00') {
			// Internet and server are offline, previous check had at least one connection
			errorToast?.remove()
			errorToast = toast({
				title: 'Internetové spojenie bolo prerušené',
				message: 'Skontrolujte prosím vaše pripojenie k internetu',
				type: 'error',
			})
			nextCheck = consecutiveFailures > 2 ? (consecutiveFailures > 6 ? 30000 : 6000) : 2000

			disconnectListeners.forEach((listener) => listener())
		} else {
			nextCheck = consecutiveFailures > 5 ? 30000 : 10000
		}
	} else if (lastCheck.status === '01') {
		if (previousCheck === undefined) {
			// Internet is online, server is offline, no previous check
			errorToast?.remove()
			errorToast = toast({
				title: 'Pripojenie k serveru zlyhalo',
				message: 'Pokus budeme opakovať...',
				type: 'warning',
			})
			consecutiveFailures = 1
			nextCheck = 1000

			disconnectListeners.forEach((listener) => listener())
		} else if (previousCheck.status !== '01') {
			// Internet is online, server is offline, previous check had server connection
			errorToast?.remove()
			errorToast = toast({
				title: 'Pripojenie k serveru bolo prerušené',
				message: 'Pokus budeme opakovať...',
				type: 'warning',
			})
			consecutiveFailures = 1
			nextCheck = 1000

			disconnectListeners.forEach((listener) => listener())
		} else {
			// Internet is online, server is offline, previous check had no server connection
			if (consecutiveFailures == 3) {
				// Internet is online, server is offline, previous check had no server connection, 3 consecutive failures
				errorToast?.remove()
				errorToast = toast({
					title: 'Pripojenie k serveru zlyhalo',
					message: 'Stránka nemusí fungovať správne',
					type: 'error',
				})
				nextCheck = 10000
			} else {
				nextCheck = 2000
			}
			if (consecutiveFailures > 3) nextCheck = 10000
		}
	} else if (lastCheck.status === '10') {
		// Internet is offline, server is online, how did this happen?
		errorToast?.remove()
		errorToast = toast({
			title: 'Stránka sa ocitla v neplatnom stave',
			message: 'Prosím, nahláste túto chybu administrátorovi (Stav: IC 10)',
			type: 'warning',
			duration: 5000,
		})
		nextCheck = 10000
	} else if (lastCheck.status === '11') {

		// Internet and server are online
		errorToast?.remove()
		if (previousCheck && !previousCheck.internet) {
			toast({
				title: 'Internetové spojenie bolo obnovené',
				type: 'success',
				duration: 5000,
			})
			reconnectListeners.forEach((listener) => listener())
		} else if (previousCheck && !previousCheck.server) {
			toast({
				title: 'Pripojenie k serveru bolo obnovené',
				type: 'success',
				duration: 5000,
			})
			reconnectListeners.forEach((listener) => listener())
		}
		consecutiveFailures = -1

		if (getAccessToken()) {
			if (!lastCheck.response.token.present) nextCheck = 10000
			else {
				const token_response = lastCheck.response.token
				if (!token_response.valid || token_response.expired || !token_response.found) {
					// User was logged out
					const state = (await import('./state/state')).userState
					await state.fetchUser()
					if (get(state).loggedIn) {
						nextCheck = 10000
					} else {
						toast({
							title: 'Boli ste odhlásený',
							type: 'error',
							duration: 5000,
						})
					}
				}
			}
		}
	}
	consecutiveFailures++
	previousCheck = { ...lastCheck }

	if (waitingCheck) clearTimeout(waitingCheck)
	waitingCheck = setTimeout(runCheck, nextCheck)
}

export function startConnectionCheck() {
	runCheck()
}
