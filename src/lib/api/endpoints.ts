import { userState } from '$lib/state'
import type { Sidebar, Results, Submission, SuccessResponse, User, Discipline, Rating, Placement } from '$lib/types'
import { get } from 'svelte/store'
import { categories, clazzes, disciplines, grades } from './models'
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

function parseDiscipline(data: any) {
	return {
		id: data.id,

		name: data.name,
		short_name: data.short_name,

		date: data.date ? new Date(data.date) : null,
		start_time: data.start_time
			? new Date('1970-01-01T' + data.start_time)
			: null,
		end_time: data.end_time
			? new Date('1970-01-01T' + data.end_time)
			: null,
		location: data.location,

		details_published: data.details_published,

		get category() {
			return get(categories)[data.category]
		},
		get target_grades() {
			return data.target_grades.map((grade: any) => get(grades)[grade])
		},
	} as Partial<Discipline>
}

/**
 * Get data for sidebar
 * @returns the sidebar data
 */
export async function getSidebar() {
	const resp = await makeApiRequest<Sidebar>('disciplines/sidebar', 'GET', undefined, true)
	if(resp.error) return resp
	const data = {
		upcoming: resp.data!.upcoming.map(parseDiscipline),
		organising: resp.data!.organising?.map(parseDiscipline),
		supervising: resp.data!.supervising?.map(parseDiscipline),
	}
	resp.data = data
	return resp
}

// USER ENDPOINTS

/**
 * Get details about the currently logged in user
 * @returns the user details
 * @throws 401 error if not logged in
 */
export async function getUserDetails(id?: string) {
	return makeApiRequest<User>(`user/${id ?? 'me'}`, 'GET', undefined, true, id ? false : true) // ignore 401 error if id is not specified
}

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

/**
 * Update the currently logged in user.
 * Before updating data, the server checks whether user has permission to update their own details.
 *
 * @param changes the new user details
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

/**
 * Update user password.
 * Before updating password, the server checks whether user has permission to update their own password.
 *
 * @param oldPassword the old password (might be empty if user has no password set yet)
 * @param newPassword the new password
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

// AUTH ENDPOINTS

/**
 * Log the user in using credentials.
 *
 * @param login the username or email
 * @param password the password
 * @returns the API token details
 * @throws 403 error if the credentials are invalid
 */
export async function login(login: string, password: string) {
	const data = {
		password: password,
		[login.includes('@') ? 'email' : 'username']: login,
	}
	return makeApiRequest<{ expiry: string; token: string }>('auth/login', 'POST', data, false)
}

/**
 * Log the user out.
 *
 * @returns server response: 204 No Content if successful and 401 error if not logged in
 * @throws 401 error if not logged in
 */
export async function logout() {
	return makeApiRequest('auth/logout', 'POST', undefined, true)
}

/**
 * Log out from all devices.
 *
 * @returns server response: 204 No Content if successful and 401 error if not logged in
 * @throws 401 error if not logged in
 */
export async function logoutAll() {
	return makeApiRequest('auth/logoutall', 'POST', undefined, true)
}

// CIPHER ENDPOINTS

/**
 * Get cipher details.
 *
 * @param id the cipher ID
 * @returns the cipher details
 */
export async function getCipherDetails(id: number) {
	return makeApiRequest<any>('ciphers/' + id, 'GET', undefined, false)
}

/**
 * Get submissions for a cipher from users class.
 *
 * @param id the cipher ID
 * @returns the submissions
 * @throws 401 error if not logged in
 */
export async function getCipherSubmissions(id: number) {
	return makeApiRequest<Submission[]>(`ciphers/${id}/submissions`, 'GET', undefined, true)
}

/**
 * Submit a solution for a cipher.
 *
 * @param id the cipher ID
 * @param solution the solution
 * @returns the submission if successful
 * @throws 401 error if not logged in
 * @throws 400 error if the solution is invalid in any way
 * @throws 429 error if the user can't submit yet
 */
export async function submitCipherSolution(id: number, solution: string) {
	return makeApiRequest<Submission>(`ciphers/${id}/submissions`, 'POST', { answer: solution }, true)
}


/**
 * Submit cipher rating.
 * 
 * @param id the cipher ID
 * @param rating the rating
 * @returns 201 Created if new rating was created, 204 No Content if existing rating was updated
 * @throws 401 error if not logged in
 * @throws 400 error if the rating is invalid in any way
 * @throws 403 error if the user hasn't solved the cipher yet
 */
export async function submitCipherRating(id: number, rating: Rating) {
	return makeApiRequest<void>(`ciphers/${id}/rating`, 'POST', { ...rating }, true)
}

// DISCIPLINE ENDPOINTS

type Operation = 'add' | 'remove'

/**
 * Add or remove user from primary organisers
 *
 * @param disciplineId the discipline ID
 * @param operation the operation to execute
 * @param user the user to add to or remove from primary organisers,
 * 			   if undefined defaults to currently logged in user
 * @returns the updated discipline object if successful
 * @throws 401 error if not logged in
 * @throws 403 error if user doesn't have necessary permissions
 * @throws 404 error if target user was not found
 * @throws 400 error if target user violates requirements
 */
export async function modifyPrimaryOrganisers(
	disciplineId: string,
	operation: Operation,
	user: string | undefined = undefined,
) {
	const resp = await makeApiRequest<object>(
		`disciplines/${disciplineId}/primary_organisers`,
		operation == 'add' ? 'PUT' : 'DELETE',
		{
			organiser: user ? user : 'me',
		},
		true,
	)
	if (resp.status == 200) {
		if (!resp.data) {
			console.error('Received status 200 but no data from primary organisers endpoint')
		} else disciplines.setRaw(disciplineId, resp.data, true)
	}
	return resp
}

/**
 * Add or remove user from teacher supervisors
 *
 * @param disciplineId the discipline ID
 * @param operation the operation to execute
 * @param user the user to add to or remove from teacher supervisors,
 * 			   if undefined defaults to currently logged in user
 * @returns the updated discipline object if successful
 * @throws 401 error if not logged in
 * @throws 403 error if user doesn't have necessary permissions
 * @throws 404 error if target user was not found
 * @throws 400 error if target user violates requirements
 */
export async function modifyTeacherSupervisors(
	disciplineId: string,
	operation: Operation,
	user: string | undefined = undefined,
) {
	const resp = await makeApiRequest<object>(
		`disciplines/${disciplineId}/teacher_supervisors`,
		operation == 'add' ? 'PUT' : 'DELETE',
		{
			teacher: user ? user : 'me',
		},
		true,
	)
	if (resp.status == 200) {
		if (!resp.data) {
			console.error('Received status 200 but no data from teacher supervisors endpoint')
		} else disciplines.setRaw(disciplineId, resp.data, true)
	}
	return resp
}

/**
 * Get results for a discipline.
 *
 * @param disciplineId the discipline ID
 * @returns the results
 * @throws 404 error if discipline was not found
 */
export async function getDisciplineResults(disciplineId: string) {
	const resp = await makeApiRequest<Results[]>(
		`disciplines/${disciplineId}/results`,
		'GET',
		undefined,
		false,
	)

	if (!resp.error) {
		const data = [] as Results[]
		for (const result of (resp as SuccessResponse<any[]>).data) {
			data.push({
				id: result.id,
				name: result.name,
				get grades() {
					return result.grades.map((g: any) => grades.get(g))
				},
				get discipline() {
					return disciplines.get(result.discipline)
				},
				get categories() {
					return result.categories.map((c: any) => categories.get(c))
				},

				placements: result.placements.map((p: any) => {
					return {
						get clazz() {
							return clazzes.get(p.clazz)
						},
						place: p.place,
						participated: p.participated,
						detail: p.detail ?? null
					} as Placement
				}),
				group_identical: result.group_identical ?? true,
			} as Results)
		}
		resp.data = data
	}
	return resp
}
