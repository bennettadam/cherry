export interface Project {
	projectID: string
	creationDate: number
	title: string
	projectShortCode: string
	description?: string
}

export interface NewProject extends Record<string, any> {
	title: string
	projectShortCode: string
	description?: string
}
