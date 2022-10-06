import { AffineTransform } from "@figurl/spike-sorting-views"
import { applyAffineTransform, createAffineTransform, identityAffineTransform, inverseAffineTransform, multAffineTransforms } from "@figurl/spike-sorting-views/dist/view-unit-similarity-matrix/AffineTransform"
import { useCallback, useState } from "react"

const useWheelZoom = (x: number, y: number, width: number, height: number) => {
    const [affineTransform, setAffineTransform] = useState<AffineTransform>(identityAffineTransform)
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (!e.shiftKey) return
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const point = {x: e.clientX - boundingRect.x - x, y: e.clientY - boundingRect.y - y}
        const deltaY = e.deltaY
        const scaleFactor = 1.3
        let X = createAffineTransform([
            [scaleFactor, 0, (1 - scaleFactor) * point.x],
            [0, scaleFactor, (1 - scaleFactor) * point.y]
        ])
        if (deltaY > 0) X = inverseAffineTransform(X)
        let newTransform = multAffineTransforms(
            X,
            affineTransform
        )
        // test to see if we should snap back to identity
        const p00 = applyAffineTransform(newTransform, {x: x, y: y})
        const p11 = applyAffineTransform(newTransform, {x: x + width, y: y + height})
        if ((x <= p00.x) && (p00.x < x + width) && (y <= p00.y) && (p00.y < y + height)) {
            if ((x <= p11.x) && (p11.x < x + width) && (y <= p11.y) && (p11.y < y + height)) {
                newTransform = identityAffineTransform
            }
        }

        setAffineTransform(newTransform)
        return false
    }, [affineTransform, x, y, height, width])
    return {
        affineTransform,
        handleWheel
    }
}

export default useWheelZoom