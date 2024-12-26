import type { ErrorResponse } from '~/models/types'

interface RequestOptions {
	body?: unknown
	headers?: Record<string, string>
}

export class APIClient {
	private static async request<T>(
		url: string,
		method: string,
		options?: RequestOptions
	): Promise<T> {
		const response = await fetch(url, {
			method,
			headers: {
				'Content-Type': 'application/json',
				...options?.headers,
			},
			body: options?.body ? JSON.stringify(options.body) : undefined,
		})

		const data = await response.json()

		if (!response.ok || data.status === 'ERROR') {
			const errorResponse = data as ErrorResponse
			throw new Error(
				errorResponse.message ||
					`Failed to ${method.toLowerCase()} resource`
			)
		}

		if (data.status !== 'SUCCESS') {
			throw new Error(`Received unknown status: ${data.status}`)
		}

		return data
	}

	static async get<T>(url: string, options?: RequestOptions): Promise<T> {
		return this.request<T>(url, 'GET', options)
	}

	static async post<T>(url: string, options?: RequestOptions): Promise<T> {
		return this.request<T>(url, 'POST', options)
	}

	static async put<T>(url: string, options?: RequestOptions): Promise<T> {
		return this.request<T>(url, 'PUT', options)
	}

	static async delete<T>(url: string, options?: RequestOptions): Promise<T> {
		return this.request<T>(url, 'DELETE', options)
	}
}