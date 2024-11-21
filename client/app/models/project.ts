export interface Project {
	projectID: string
	creationDate: number
	name: string
	projectShortCode: string
	description?: string
}

export interface NewProject extends Record<string, any> {
	name: string
	projectShortCode: string
	description?: string
}
