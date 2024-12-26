import { Outlet, useOutletContext } from '@remix-run/react'
import { useParams } from '@remix-run/react'
import {
	PropertyConfigurationDetailsOutletContext,
	PropertyConfigurationOutletContext,
} from '~/models/types'

export default function PropertyDetailsIndex() {
	const { propertyID } = useParams()
	if (!propertyID) {
		return <div>Property ID not found</div>
	}

	const { properties } = useOutletContext<PropertyConfigurationOutletContext>()
	const property = properties.find(
		(property) => property.propertyConfigurationID === propertyID
	)
	if (!property) {
		return <div>Property not found</div>
	}

	const outletContext: PropertyConfigurationDetailsOutletContext = {
		property,
	}

	return <Outlet context={outletContext} />
}
