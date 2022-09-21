export type PostureAnnotation = {
	eventId: string
	markers: {
		x: number, y: number, key: string
	}[]
}

type PostureAnnotations = PostureAnnotation[]

export type PostureAnnotationsAction = {
	type: 'setPostureAnnotation'
	eventId: string
	markers: {
		x: number, y: number, key: string
	}[]
} | {
	type: 'setPostureAnnotationMarker'
	eventId: string
	marker: {
		x: number, y: number, key: string
	}
} | {
	type: 'addPostureAnnotationMarker'
	eventId: string,
	x: number, y: number
} | {
    type: 'setPostureAnnotations'
    postureAnnotations: PostureAnnotation[]
}

export const postureAnnotationsReducer = (s: PostureAnnotations, a: PostureAnnotationsAction): PostureAnnotations => {
	if (a.type === 'setPostureAnnotation') {
		return [...s.filter(x => (x.eventId !== a.eventId)), {eventId: a.eventId, markers: a.markers}]
	}
	else if (a.type === 'setPostureAnnotationMarker') {
		return s.map(x => (x.eventId === a.eventId ? ({...x, markers: [...x.markers.filter(m => (m.key !== a.marker.key)), a.marker]}) : x))
	}
	else if (a.type === 'addPostureAnnotationMarker') {
		return s.map(x => ((x.eventId === a.eventId) ? (
			{...x, markers: addMarker(x.markers, a.x, a.y)}
		) : x))
	}
    else if (a.type === 'setPostureAnnotations') {
        return a.postureAnnotations
    }
	else return s
}

const addMarker = (markers: {x: number, y: number, key: string}[], x: number, y: number) => {
	if (!markers.map(m => (m.key)).includes('A')) {
		return [...markers, {key: 'A', x, y}]
	}
	else if (!markers.map(m => (m.key)).includes('B')) {
		return [...markers, {key: 'B', x, y}]
	}
	else return markers
}