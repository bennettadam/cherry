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
