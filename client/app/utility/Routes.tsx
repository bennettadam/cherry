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
}

export class APIRoute {
	static get projects() {
		return 'http://localhost:8080/api/v1/workspace/projects'
	}

	static get properties() {
		return 'http://localhost:8080/api/v1/workspace/properties'
	}
}
