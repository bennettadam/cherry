import {
	PropertyConfiguration,
	TestCase,
	PropertyValue,
	PropertyType,
} from '~/models/types'
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

	static propertyTypeToDisplayText(propertyType: PropertyType): string {
		switch (propertyType) {
			case PropertyType.text:
				return 'Text'
			case PropertyType.number:
				return 'Number'
			case PropertyType.singleSelectList:
				return 'Option select'
			default:
				return 'Unknown'
		}
	}
}
