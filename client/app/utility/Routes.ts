export class Route {
	static viewTestCases(projectShortCode: string) {
		return `/test-cases/${projectShortCode}`
	}

	static viewTestCase(projectShortCode: string, testCaseNumber: number) {
		return `/test-cases/${projectShortCode}/${testCaseNumber}`
	}

	static get viewProperties() {
		return '/configuration/properties'
	}

	static newTestRun(projectID: string) {
		return `/${projectID}/test-runs/new`
	}

	static viewTestRuns(projectID: string) {
		return `/${projectID}/test-runs`
	}

	static viewTestRun(projectID: string, testRunID: string) {
		return `/${projectID}/test-runs/${testRunID}`
	}

	static editTestRun(projectID: string, testRunID: string) {
		return `/${projectID}/test-runs/${testRunID}/edit`
	}
}

export class RouteLoaderIDs {
	static get projectTestCasesRoot() {
		return 'routes/test-cases.$projectShortCode'
	}
}

export class APIRoute {
	static get projects() {
		return 'http://localhost:8080/api/v1/workspace/projects'
	}

	static testCases(projectShortCode: string) {
		return `http://localhost:8080/api/v1/workspace/test-cases/${projectShortCode}`
	}

	static get properties() {
		return 'http://localhost:8080/api/v1/workspace/properties'
	}

	static property(propertyID: string) {
		return `http://localhost:8080/api/v1/workspace/properties/${propertyID}`
	}

	static testRuns(projectID: string) {
		return `http://localhost:8080/api/v1/workspace/projects/${projectID}/test-runs`
	}

	static testRunByID(testRunID: string) {
		return `http://localhost:8080/api/v1/workspace/test-runs/${testRunID}`
	}

	static testCaseRuns(testRunID: string) {
		return `http://localhost:8080/api/v1/workspace/test-runs/${testRunID}/test-cases`
	}
}
