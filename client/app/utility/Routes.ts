export class Route {
	static get index() {
		return '/'
	}

	static get newProject() {
		return '/projects/new'
	}

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

	static viewTestCaseRun(
		projectShortCode: string,
		testRunNumber: number,
		testCaseNumber: number
	) {
		return `/test-runs/${projectShortCode}/${testRunNumber}/${testCaseNumber}`
	}

	static get viewProperties() {
		return '/configuration/properties'
	}

	static viewProperty(propertyID: string) {
		return `/configuration/properties/${propertyID}`
	}
}

export class APIRoute {
	private static get baseAPIURL() {
		return process.env.VITE_API_URL
	}

	static get projects() {
		return `${this.baseAPIURL}/api/v1/workspace/projects`
	}

	static projectTestCases(projectShortCode: string) {
		return `${this.baseAPIURL}/api/v1/workspace/test-cases/${projectShortCode}`
	}

	static testCase(testCaseID: string) {
		return `${this.baseAPIURL}/api/v1/workspace/test-cases/${testCaseID}`
	}

	static projectTestRuns(projectShortCode: string) {
		return `${this.baseAPIURL}/api/v1/workspace/test-runs/${projectShortCode}`
	}

	static testRun(testRunID: string) {
		return `${this.baseAPIURL}/api/v1/workspace/test-runs/${testRunID}`
	}

	static exportTestRun(projectShortCode: string, testRunNumber: number) {
		return `${this.baseAPIURL}/api/v1/workspace/test-runs/${projectShortCode}/${testRunNumber}/export`
	}

	static projectTestCaseRuns(projectShortCode: string, testRunNumber: number) {
		return `${this.baseAPIURL}/api/v1/workspace/test-case-runs/${projectShortCode}/${testRunNumber}`
	}

	static testCaseRun(testCaseRunID: string) {
		return `${this.baseAPIURL}/api/v1/workspace/test-case-runs/${testCaseRunID}`
	}

	static nextTestCaseRun(testCaseRunID: string) {
		return `${this.baseAPIURL}/api/v1/workspace/test-case-runs/${testCaseRunID}/next`
	}

	static get properties() {
		return `${this.baseAPIURL}/api/v1/workspace/properties`
	}

	static property(propertyID: string) {
		return `${this.baseAPIURL}/api/v1/workspace/properties/${propertyID}`
	}
}
