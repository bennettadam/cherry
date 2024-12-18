export class Route {
	static viewTests(projectID: string) {
		return `/${projectID}/tests`
	}

	static viewTestCase(projectID: string, testCaseID: string) {
		return `/${projectID}/${testCaseID}`
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
}

export class APIRoute {
	static get projects() {
		return 'http://localhost:8080/api/v1/workspace/projects'
	}

	static testCases(projectID: string) {
		return `http://localhost:8080/api/v1/workspace/projects/${projectID}/test-cases`
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

	static testCaseRuns(testRunID: string) {
		return `http://localhost:8080/api/v1/workspace/test-runs/${testRunID}/test-cases`
	}
}
