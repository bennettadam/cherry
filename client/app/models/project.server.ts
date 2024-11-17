import type { Project, TestCase, PropertyConfiguration } from './types'

// Singleton store for projects
class ProjectStore {
	private projects: Project[] = []
	private testCases: Record<string, TestCase[]> = {}
	private propertyConfigurations: PropertyConfiguration[] = [
		{
			id: '1',
			name: 'Title',
			propertyType: 'text',
			propertyOptions: [],
			createdAt: new Date().toISOString(),
		},
		{
			id: '2',
			name: 'Description',
			propertyType: 'text',
			propertyOptions: [],
			createdAt: new Date().toISOString(),
		},
		{
			id: '3',
			name: 'Priority',
			propertyType: 'enum',
			propertyOptions: ['Critical', 'High', 'Medium', 'Low'],
			defaultValue: 'Medium',
			createdAt: new Date().toISOString(),
		},
		{
			id: '4',
			name: 'Type',
			propertyType: 'enum',
			propertyOptions: ['Other', 'Functional', 'Smoke', 'Exploratory'],
			defaultValue: 'Other',
			createdAt: new Date().toISOString(),
		},
	]

	addProject(project: Project) {
		this.projects.push(project)
		this.testCases[project.projectID] = []
	}

	getProjects() {
		return [...this.projects]
	}

	getProject(projectID: string) {
		return this.projects.find((p) => p.projectID === projectID)
	}

	addTestCase(
		projectID: string,
		testCase: Omit<TestCase, 'testCaseID' | 'projectID' | 'createdAt'>
	) {
		if (!this.testCases[projectID]) {
			this.testCases[projectID] = []
		}

		const newTestCase: TestCase = {
			testCaseID: crypto.randomUUID(),
			projectID,
			createdAt: new Date().toISOString(),
			...testCase,
		}

		this.testCases[projectID].push(newTestCase)
		return newTestCase
	}

	getTestCases(projectID: string) {
		return this.testCases[projectID] ?? []
	}

	updateTestCase(
		projectID: string,
		testCaseID: string,
		updates: {
			title: string
			description: string
			priority: string
		}
	) {
		const testCases = this.testCases[projectID]
		const testCase = testCases.find((t) => t.testCaseID === testCaseID)

		if (!testCase) {
			return
		}

		// Apply the updates to the test case
		Object.assign(testCase, updates)
		return testCase
	}

	getPropertyConfigurations() {
		return [...this.propertyConfigurations]
	}

	addPropertyConfiguration(property: PropertyConfiguration) {
		this.propertyConfigurations.push(property)
		return property
	}

	getPropertyConfiguration(propertyID: string) {
		return this.propertyConfigurations.find((p) => p.id === propertyID)
	}

	updatePropertyConfiguration(
		propertyID: string,
		updates: {
			name: string
			propertyType: PropertyType
			propertyOptions: string[]
			defaultValue?: string
		}
	) {
		const property = this.propertyConfigurations.find(
			(p) => p.id === propertyID
		)

		if (!property) {
			return
		}

		Object.assign(property, updates)
		return property
	}
}

// Export a single instance
export const projectStore = new ProjectStore()
