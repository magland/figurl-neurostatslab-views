export type PostureAnnotation = {
	frameId: string
	markers: {
		x: number, y: number, key: string
	}[]
}

type PostureAnnotations = PostureAnnotation[]

export type PostureAnnotationsAction = {
	type: 'setPostureAnnotation'
	frameId: string
	markers: {
		x: number, y: number, key: string
	}[]
} | {
	type: 'setPostureAnnotationMarker'
	frameId: string
	marker: {
		x: number, y: number, key: string
	}
} | {
    type: 'setPostureAnnotations'
    postureAnnotations: PostureAnnotation[]
}

export const postureAnnotationsReducer = (s: PostureAnnotations, a: PostureAnnotationsAction): PostureAnnotations => {
	if (a.type === 'setPostureAnnotation') {
		return [...s.filter(x => (x.frameId !== a.frameId)), {frameId: a.frameId, markers: a.markers}]
	}
	else if (a.type === 'setPostureAnnotationMarker') {
		return s.map(x => (x.frameId === a.frameId ? ({...x, markers: [...x.markers.filter(m => (m.key !== a.marker.key)), a.marker]}) : x))
	}
    else if (a.type === 'setPostureAnnotations') {
        return a.postureAnnotations
    }
	else return s
}