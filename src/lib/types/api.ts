export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface ApiResponse<T = void> {
	status: number
	error: boolean
	data?: T
}

export interface ErrorResponse extends ApiResponse {
	error: true
	data?: any
}

export interface SuccessResponse<T> extends ApiResponse<T> {
	data: T
	error: false
}
