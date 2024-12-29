import { type LoaderFunctionArgs } from '@remix-run/node'
import { APIRoute } from '~/utility/Routes'
import { APIClient } from '~/utility/APIClient'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const type = url.searchParams.get('type')
	if (!type) {
		throw new Response('Type is required', {
			status: 400,
		})
	}

	const projectShortCode = params.projectShortCode
	const testRunNumber = Number(params.testRunNumber)
	if (!projectShortCode || !testRunNumber) {
		throw new Response(
			'Project short code and test run number are required',
			{
				status: 400,
			}
		)
	}

	const apiRoute = new URL(
		APIRoute.exportTestRun(projectShortCode, testRunNumber)
	)
	apiRoute.searchParams.set('type', type)
	const response = await APIClient.postWithResponse(apiRoute.toString(), {
		body: { type },
	})

	if (!response.ok) {
		throw new Response(`Failed to export test run: ${response.statusText}`, {
			status: 500,
		})
	}

	const contentType = response.headers.get('Content-Type')
	const contentDisposition = response.headers.get('Content-Disposition')

	if (!contentType || !contentDisposition) {
		throw new Response('Failed to export test run due to missing headers', {
			status: 500,
		})
	}

	const blob = await response.blob()

	return new Response(blob, {
		status: 200,
		headers: {
			'Content-Type': contentType,
			'Content-Disposition': contentDisposition,
		},
	})
}
