import { getApiHost } from '$lib/data/api'
import { toast } from '$lib/utils/toasts'
import { get } from 'svelte/store'
import { getAccessToken, setAccessToken } from './state/token'

type Check = {
	time: number
	server: boolean
	internet: boolean
	status: '00' | '01' | '10' | '11'
	response: {
		status: string
		time: string
		authenticated: boolean
	}
}

let consecutiveFailures = 0
let previousCheck: Check | undefined = undefined
const checkResult: Check = {
	time: -1,
	server: false,
	internet: false,
	status: '00', // 00 = offline, 01 = internet, 10 = server, 11 = online (10 should happen only in dev)
	response: {
		status: 'error',
		time: '',
		authenticated: false,
	},
}

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
			checkResult.server = true
		} else if (serverResult.status === 401) {
			try {
				console.log('Status check returned 401, validating logout...')
				// User was probably logged out
				const state = (await import('./state/state')).userState
				await state.fetchUser()
				if (!get(state).loggedIn) {
					toast({
						title: 'Boli ste odhlásený',
						type: 'error',
						duration: 5000,
					})
				}
			} catch (e) {
				console.error('Failed to validate logout', e)
				console.error('Forcing local logout for safety reasons...')
				setAccessToken(undefined)
				toast({
					title: 'Boli ste odhlásený',
					message: 'Počas spracovávania údajov nastala chyba',
					type: 'error',
					duration: 5000,
				})
			}
			await runCheck()
		} else {
			checkResult.server = false
		}
		checkResult.response = await serverResult.json()
	} catch (e) {
		checkResult.server = false
		checkResult.response = {
			status: 'error',
			time: '',
			authenticated: false,
		}
	}
	checkResult.internet = navigator.onLine
	checkResult.status = (checkResult.server ? '1' : '0') + (checkResult.internet ? '1' : '0') as Check['status']
	checkResult.time = now
	processCheckResult()
}

async function processCheckResult() {
	let nextCheck = 60000
	if (checkResult.status === '00') {
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
	} else if (checkResult.status === '01') {
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
				nextCheck = 20000
			} else {
				nextCheck = 2000
			}
			if (consecutiveFailures > 3) nextCheck = 20000
		}
	} else if (checkResult.status === '10') {
		if(window.location.host.includes('localhost') || window.location.host.includes('127.0.0.1')) {
			errorToast?.remove()
			consecutiveFailures = -1
		} else if (consecutiveFailures == 0) {
			// Internet is offline, server is online and the host isn't local, how did this happen?
			errorToast?.remove()
			errorToast = toast({
				title: 'Bez internetu',
				message: 'Server je dostupný aj bez internetu. Funkcionalita stránky môže byť obmedzená',
				type: 'warning',
				duration: 10000,
			})
			nextCheck = 20000
		}
	} else if (checkResult.status === '11') {
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
			if (!checkResult.response.authenticated) {
				console.log('Status check returned unauthenticated, validating...')
				// User was probably logged out
				const state = (await import('./state/state')).userState
				await state.fetchUser()
				if (!get(state).loggedIn) {
					toast({
						title: 'Boli ste odhlásený',
						type: 'error',
						duration: 5000,
					})
				}
				// Execute next status check earlier, just to check everything is fine
				nextCheck = 10000
			}
		}
	}
	consecutiveFailures++
	previousCheck = { ...checkResult }

	if (waitingCheck) clearTimeout(waitingCheck)
	waitingCheck = setTimeout(runCheck, nextCheck)
}

export function startConnectionCheck() {
	runCheck()
}
