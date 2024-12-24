import { PropertyConfiguration, TestCase, PropertyValue } from '~/models/types'
import { Project } from '../models/project'

export class Tools {
	static mapTestCaseProperties(
		testCase: TestCase,
		properties: PropertyConfiguration[]
	): PropertyValue[] {
		return properties.map((propertyConfiguration) => {
			return {
				propertyConfiguration,
				value: testCase.propertyValues[
					propertyConfiguration.propertyConfigurationID
				],
			}
		})
	}

	static testCaseDisplayCode(project: Project, testCase: TestCase) {
		return `${project.projectShortCode}-${testCase.testCaseNumber}`
	}

	static capitalizeFirstLetter(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
	}
}
