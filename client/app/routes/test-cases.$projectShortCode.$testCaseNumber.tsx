import { type LoaderFunctionArgs } from '@remix-run/node'
import {
	useLoaderData,
	Link,
	useRouteLoaderData,
	useParams,
	useMatches,
	Outlet,
} from '@remix-run/react'
import { APIRoute } from '~/utility/Routes'
import {
	FetchResponse,
	ProjectTestCaseOutletContext,
	PropertyConfiguration,
	PropertyValue,
	TestCase,
} from '~/models/types'
import { Tools } from '~/utility/Tools'

export async function loader({ params }: LoaderFunctionArgs) {
	const propertiesResponse = await fetch(APIRoute.properties, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!propertiesResponse.ok) {
		throw new Error('Failed to fetch properties')
	}

	const properties = (await propertiesResponse.json()) as FetchResponse<
		PropertyConfiguration[]
	>

	const projectShortCode = params.projectShortCode
	if (!projectShortCode) {
		throw new Response('Project short code is required', { status: 400 })
	}
	const testCaseNumber = Number(params.testCaseNumber)
	if (!testCaseNumber) {
		throw new Response('Test case number is required', { status: 400 })
	}

	const response = await fetch(APIRoute.testCases(projectShortCode), {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Response('Failed to fetch test cases', { status: 500 })
	}

	const testCases = (await response.json()) as FetchResponse<TestCase[]>
	const testCase = testCases.data.find(
		(testCase) => testCase.testCaseNumber === testCaseNumber
	)

	if (!testCase) {
		throw new Response('Test case not found', { status: 404 })
	}

	return { testCase, properties: properties.data }
}

export default function TestCaseDetailsRoot() {
	const { testCase, properties } = useLoaderData<typeof loader>()

	const propertyValues: PropertyValue[] = Tools.mapTestCaseProperties(
		testCase,
		properties
	)

	const context: ProjectTestCaseOutletContext = {
		testCase,
		properties,
		propertyValues,
	}

	return <Outlet context={context} />
}
