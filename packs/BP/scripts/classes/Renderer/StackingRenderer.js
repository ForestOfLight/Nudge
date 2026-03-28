import { debugDrawer, DebugBox, DebugLine } from "@minecraft/debug-utilities";
import { CuboidRenderer } from "./CuboidRenderer";
import { RGBColor } from "./RGBColor";
import { Vector } from "../../lib/Vector";

export class StackingRenderer extends CuboidRenderer {
    selectionSize;
    cuboidShape;
    shapesOnFaces = [];
    color = RGBColor.White;

    constructor(dimension, min, max, selectionSize) {
        super(dimension, min, max);
        this.selectionSize = selectionSize.add(new Vector(1, 1, 1));
        this.drawCuboid();
        this.drawGridOnFaces();
    }

    destroy() {
        this.shapesOnFaces.forEach(shape => {
            debugDrawer.removeShape(shape);
        });
        this.shapesOnFaces = [];
        if (this.cuboidShape) {
            debugDrawer.removeShape(this.cuboidShape);
            this.cuboidShape = void 0;
        }
    }

    drawCuboid() {
        if (this.cuboidShape)
            this.cuboidShape.remove();
        const dimensionLocation = Vector.from(this.blockVolume.getSpan()).multiply(0.5).add(this.blockVolume.getMin());
        dimensionLocation.dimension = this.dimension;
        const boundingBox = new DebugBox(dimensionLocation);
        boundingBox.bound = this.blockVolume.getSpan();
        boundingBox.color = this.color;
        this.cuboidShape = boundingBox;
        debugDrawer.addShape(boundingBox);
    }

    drawGridOnFaces() {
        this.shapesOnFaces.forEach(shape => debugDrawer.removeShape(shape));
        this.shapesOnFaces = [];
        const min = this.blockVolume.getMin();
        const max = Vector.from(this.blockVolume.getMax()).add(new Vector(1, 1, 1));
        const vertices = this.getVertexIndexes(min, max);
        const faces = this.getFaceIndexes();
        for (const [startIdx, endIdx] of faces)
            this.drawFaceGrid(vertices[startIdx], vertices[endIdx]);
    }

    drawFaceGrid(startVertex, endVertex) {
        const linesOnThisFace = this.getLinesForFace(startVertex, endVertex);
        for (const { start, end } of linesOnThisFace) {
            if (start.distance(end) === 0) continue;
            start.dimension = this.dimension;
            const line = new DebugLine(start, end);
            line.color = RGBColor.LightGrey;
            this.shapesOnFaces.push(line);
            debugDrawer.addShape(line);
        }
    }

    getLinesForFace(startVertex, endVertex) {
        const [faceMin, faceMax] = Vector.sort(startVertex, endVertex);
        const lines = [];
        if (startVertex.x === endVertex.x) {
            const x = startVertex.x;
            for (let y = faceMin.y; y < faceMax.y; y += this.selectionSize.y) {
                const start = new Vector(x, y, faceMin.z);
                const end = new Vector(x, y, faceMax.z);
                lines.push({ start, end });
            }
            for (let z = faceMin.z; z < faceMax.z; z += this.selectionSize.z) {
                const start = new Vector(x, faceMin.y, z);
                const end = new Vector(x, faceMax.y, z);
                lines.push({ start, end });
            }
        } else if (startVertex.y === endVertex.y) {
            const y = startVertex.y;
            for (let x = faceMin.x; x < faceMax.x; x += this.selectionSize.x) {
                const start = new Vector(x, y, faceMin.z);
                const end = new Vector(x, y, faceMax.z);
                lines.push({ start, end });
            }
            for (let z = faceMin.z; z < faceMax.z; z += this.selectionSize.z) {
                const start = new Vector(faceMin.x, y, z);
                const end = new Vector(faceMax.x, y, z);
                lines.push({ start, end });
            }
        } else if (startVertex.z === endVertex.z) {
            const z = startVertex.z;
            for (let x = faceMin.x; x < faceMax.x; x += this.selectionSize.x) {
                const start = new Vector(x, faceMin.y, z);
                const end = new Vector(x, faceMax.y, z);
                lines.push({ start, end });
            }
            for (let y = faceMin.y; y < faceMax.y; y += this.selectionSize.y) {
                const start = new Vector(faceMin.x, y, z);
                const end = new Vector(faceMax.x, y, z);
                lines.push({ start, end });
            }
        }
        return lines;
    }
}