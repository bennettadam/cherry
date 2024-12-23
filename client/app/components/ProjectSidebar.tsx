import { Route } from '~/utility/Routes'
import Sidebar from '~/components/Sidebar'

interface ProjectSidebarProps {
	projectShortCode: string
	title: string
	description?: string
}

export default function ProjectSidebar({
	projectShortCode,
	title,
	description,
}: ProjectSidebarProps) {
	const items = [
		{ to: Route.viewProjectTestCases(projectShortCode), label: 'Test Cases' },
		{ to: Route.viewProjectTestRuns(projectShortCode), label: 'Test Runs' },
	]

	return <Sidebar title={title} description={description} items={items} />
}
