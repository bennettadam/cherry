import { useParams, Outlet, useOutletContext } from '@remix-run/react'
import {
	ProjectTestCasesOutletContext,
	PropertyValue,
	TestCaseOutletContext,
} from '~/models/types'
import { Tools } from '~/utility/Tools'

export default function TestCaseDetailsRoot() {
	const params = useParams()
	const testCaseNumber = Number(params.testCaseNumber)
	if (!testCaseNumber) {
		return <p>No test case number found</p>
	}

	const { project, testCases, properties } =
		useOutletContext<ProjectTestCasesOutletContext>()
	const testCase = testCases.find(
		(testCase) => testCase.testCaseNumber === testCaseNumber
	)
	if (!testCase) {
		return <p>Test case not found</p>
	}

	const propertyValues: PropertyValue[] = Tools.mapTestCaseProperties(
		testCase,
		properties
	)

	const context: TestCaseOutletContext = {
		project,
		testCase,
		properties,
		propertyValues,
	}

	return <Outlet context={context} />
}
