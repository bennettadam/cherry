export class Route {
	static viewProjectTestCases(projectShortCode: string) {
		return `/test-cases/${projectShortCode}`
	}

	static viewTestCase(projectShortCode: string, testCaseNumber: number) {
		return `/test-cases/${projectShortCode}/${testCaseNumber}`
	}

	static viewProjectTestRuns(projectShortCode: string) {
		return `/test-runs/${projectShortCode}`
	}

	static viewTestRun(projectShortCode: string, testRunNumber: number) {
		return `/test-runs/${projectShortCode}/${testRunNumber}`
	}

	static get viewProperties() {
		return '/configuration/properties'
	}

	static viewProperty(propertyID: string) {
		return `/configuration/properties/${propertyID}`
	}
}

export class APIRoute {
	static get projects() {
		return 'http://localhost:8080/api/v1/workspace/projects'
	}

	static projectTestCases(projectShortCode: string) {
		return `http://localhost:8080/api/v1/workspace/test-cases/${projectShortCode}`
	}

	static testCase(testCaseID: string) {
		return `http://localhost:8080/api/v1/workspace/test-cases/${testCaseID}`
	}

	static projectTestRuns(projectShortCode: string) {
		return `http://localhost:8080/api/v1/workspace/test-runs/${projectShortCode}`
	}

	static testRun(testRunID: string) {
		return `http://localhost:8080/api/v1/workspace/test-runs/${testRunID}`
	}

	static projectTestCaseRuns(projectShortCode: string, testRunNumber: number) {
		return `http://localhost:8080/api/v1/workspace/test-case-runs/${projectShortCode}/${testRunNumber}`
	}

	static testCaseRun(testCaseRunID: string) {
		return `http://localhost:8080/api/v1/workspace/test-case-runs/${testCaseRunID}`
	}

	static get properties() {
		return 'http://localhost:8080/api/v1/workspace/properties'
	}

	static property(propertyID: string) {
		return `http://localhost:8080/api/v1/workspace/properties/${propertyID}`
	}
}
