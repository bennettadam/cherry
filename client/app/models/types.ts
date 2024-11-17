export interface Project {
	projectID: string
	name: string
	description: string
	createdAt: string
}

export interface TestCase {
	testCaseID: string
	projectID: string
	title: string
	description: string
	priority: 'critical' | 'high' | 'medium' | 'low'
	type:
		| 'other'
		| 'functional'
		| 'smoke'
		| 'regression'
		| 'security'
		| 'acceptance'
		| 'compatibility'
		| 'exploratory'
	steps: string
	createdAt: string
}

export type PropertyType = 'text' | 'number' | 'enum'

export interface PropertyConfiguration {
	id: string
	name: string
	propertyType: PropertyType
	propertyOptions: string[]
	defaultValue?: string
	createdAt: string
}
