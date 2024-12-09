import { PropertyConfiguration, TestCase, PropertyValue } from '~/models/types'

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
}
