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

export enum PropertyType {
	text = 'TEXT',
	number = 'NUMBER',
	enum = 'ENUM',
}

export enum PropertyConfigurationSource {
	system = 'SYSTEM',
	customer = 'CUSTOMER',
}

export interface PropertyConfiguration {
	propertyConfigurationID: string
	creationDate: number
	source: PropertyConfigurationSource
	name: string
	propertyType: PropertyType
	isRequired: boolean
	defaultValue?: string
	enumOptions?: string[]
}

export interface EnumConfiguration {
	options: string[]
	defaultValue?: string
}

export interface PropertyConfigurationResponse {
	data: PropertyConfiguration[]
}

export interface FetchResponse<T> {
	data: T[]
}
