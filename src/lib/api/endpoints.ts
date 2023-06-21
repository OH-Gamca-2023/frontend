import { userState } from '$lib/state'
import type { Submission, User } from '$lib/types'
import { makeApiRequest } from './requests'

/**
 * All API endpoints MUST have proper comments.
 * The comments have to include the following:
 * - Description of the endpoint
 * - Parameters
 * - Return value when successful (if any)
 * - Error codes and their meaning
 */

// GENERIC ENDPOINTS

/**
 * Get the server status.
 * @returns the server status
 */
export async function getServerStatus() {
	return makeApiRequest<{ status: string }>('status', 'GET', undefined, false)
}
getServerStatus.requiresAuth = false

// USER ENDPOINTS

/**
 * Get details about the currently logged in user
 * @returns the user details
 * @throws 401 error if not logged in
 */
export async function getUserDetails(id?: string) {
	return makeApiRequest<User>(`user/${id ?? 'me'}`, 'GET', undefined, true, id ? false : true) // ignore 401 error if id is not specified
}
getUserDetails.requiresAuth = true

/**
 * Get the permissions of the currently logged in user
 * @returns the user permissions
 * @throws 401 error if not logged in
 */
export async function getUserPermissions() {
	return makeApiRequest<{
		user_type: string
		permissions: string[]
		details?: string
		profile_edit: string[]
		staff: boolean
		admin: boolean
		superuser: boolean
	}>('user/me/permissions', 'GET', undefined, true)
}
getUserPermissions.requiresAuth = true

/**
 * Update the currently logged in user.
 * Before updating data, the server checks whether user has permission to update their own details.
 *
 * @param changes The new user details
 * @returns the updated user details
 * @throws 400 error if the new user details are invalid
 * @throws 401 error if not logged in
 * @throws 403 error if user doesn't have permission to update their own details
 * @throws 409 error if the new user details conflict with existing data
 */
export async function setUserDetails(changes: Partial<User>) {
	const resp = await makeApiRequest<User>('user/me', 'POST', changes, true)
	if (!resp.error) {
		await userState.fetchUser()
	}
	return resp
}
setUserDetails.requiresAuth = true

/**
 * Update user password.
 * Before updating password, the server checks whether user has permission to update their own password.
 *
 * @param oldPassword The old password (might be empty if user has no password set yet)
 * @param newPassword The new password
 * @returns 204 No Content
 * @throws 400 error if old password is incorrect
 * @throws 401 error if not logged in
 * @throws 403 error if user doesn't have permission to update their own password
 * @throws 409 error if the new password fails to meet the password requirements
 */
export async function setUserPassword(oldPassword: string | undefined, newPassword: string) {
	return makeApiRequest(
		'user/me/password',
		oldPassword ? 'PUT' : 'POST',
		{ old_password: oldPassword, new_password: newPassword },
		true,
	)
}
setUserPassword.requiresAuth = true

// AUTH ENDPOINTS

/**
 * Log the user out.
 *
 * @returns Server response: 204 No Content if successful and 401 error if not logged in
 * @throws 401 error if not logged in
 */
export async function logout() {
	return makeApiRequest('auth/logout', 'POST', undefined, true)
}
logout.requiresAuth = true

/**
 * Log out from all devices.
 *
 * @returns Server response: 204 No Content if successful and 401 error if not logged in
 * @throws 401 error if not logged in
 */
export async function logoutAll() {
	return makeApiRequest('auth/logoutall', 'POST', undefined, true)
}

// CIPHER ENDPOINTS

/**
 * Get cipher details.
 *
 * @param id The cipher ID
 * @returns the cipher details
 */
export async function getCipherDetails(id: number) {
	return makeApiRequest<any>('ciphers/' + id, 'GET', undefined, false)
}

/**
 * Get submissions for a cipher from users class.
 *
 * @param id The cipher ID
 * @returns the submissions
 * @throws 401 error if not logged in
 */
export async function getCipherSubmissions(id: number) {
	return makeApiRequest<Submission[]>(`ciphers/${id}/submissions`, 'GET', undefined, true)
}

/**
 * Submit a solution for a cipher.
 *
 * @param id The cipher ID
 * @param solution The solution
 * @returns the submission if successful
 * @throws 401 error if not logged in
 * @throws 400 error if the solution is invalid in any way
 * @throws 429 error if the user can't submit yet
 */
export async function submitCipherSolution(id: number, solution: string) {
	return makeApiRequest<Submission>(`ciphers/${id}/submissions`, 'POST', { answer: solution }, true)
}
