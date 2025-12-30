import { debugDrawer, DebugLine, DebugArrow, DebugText } from "@minecraft/debug-utilities";
import { Vector } from "../../lib/Vector";
import { CuboidRenderer } from "./CuboidRenderer";
import { BlockVolume } from "@minecraft/server";
import { MirrorRotateRenderer } from "./MirrorRotateRenderer";
import { RGBColor } from "./RGBColor";

export class NudgingCuboidRenderer extends CuboidRenderer {
    initialVolume;
    playerMovement;
    mirrorRotateRenderer;
    shouldRedraw = false;
    
    edgeShapes = [];
    directionArrowShape;
    offsetTextShape;

    constructor(dimension, min, max, playerMovement) {
        super(dimension, min, max);
        this.initialVolume = new BlockVolume(min, max);
        this.playerMovement = playerMovement;
        const mirrorRotateRenderLocation = this.getCenterpoint().add(new Vector(0, -1, 0));
        this.mirrorRotateRenderer = new MirrorRotateRenderer(this.dimension, mirrorRotateRenderLocation);
    }

    destroy() {
        this.edgeShapes.forEach(shape => debugDrawer.removeShape(shape));
        if (this.directionArrowShape)
            debugDrawer.removeShape(this.directionArrowShape);
        if (this.offsetTextShape)
            debugDrawer.removeShape(this.offsetTextShape);
        this.mirrorRotateRenderer?.destroy();
        this.edgeShapes = [];
        this.directionArrowShape = void 0;
        this.offsetTextShape = void 0;
        this.mirrorRotateRenderer = void 0;
    }

    setLocation(min, max) {
        const oldMin = this.blockVolume.getMin();
        const oldMax = this.blockVolume.getMax();
        if (min.distance(oldMin) !== 0 || max.distance(oldMax) !== 0 || this.shouldRedraw) {
            super.setLocation(min, max);
            const mirrorRotateRenderLocation = this.getCenterpoint().add(new Vector(0, -1, 0));
            this.mirrorRotateRenderer.setLocation(mirrorRotateRenderLocation);
            this.drawOffsetText();
            this.shouldRedraw = false;
        }
        if (this.shouldDirectionArrowMove(min, max))
            this.drawDirectionArrow();
    }

    setMirrorAxis(mirrorAxis) {
        this.mirrorRotateRenderer.setMirrorAxis(mirrorAxis);
        this.shouldRedraw = true;
    }

    setRotation(rotation) {
        this.mirrorRotateRenderer.setRotation(rotation);
        this.shouldRedraw = true;
    }

    getCenterpoint() {
        const min = Vector.from(this.blockVolume.getMin());
        const max = Vector.from(this.blockVolume.getMax());
        const relativeCenterpoint = max.subtract(min).add(new Vector(1, 1, 1)).multiply(0.5);
        return min.add(relativeCenterpoint);
    }

    drawCuboid() {
        this.edgeShapes.forEach(shape => debugDrawer.removeShape(shape));
        this.edgeShapes.length = 0;
        this.getMovingCuboidEdgeShapes().forEach(shape => this.drawEdgeShape(shape) );
    }
    
    drawEdgeShape(shape) {
        this.edgeShapes.push(shape);
        debugDrawer.addShape(shape);
    }
    
    getMovingCuboidEdgeShapes() {
        const min = this.blockVolume.getMin();
        const max = Vector.from(this.blockVolume.getMax()).add(new Vector(1, 1, 1));
        const vertices = this.getVertexIndexes(min, max);
        const edges = this.getEdges();
        const debugLines = [];
        for (const [startIdx, endIdx] of edges) {
            const startLocation = vertices[startIdx];
            const endLocation = vertices[endIdx];
            debugLines.push(this.getEdgeShape(startLocation, endLocation));
        }
        return debugLines;
    }

    getEdgeShape(startVertex, endVertex) {
        startVertex.dimension = this.dimension;
        const line = new DebugLine(startVertex, endVertex);
        const min = this.blockVolume.getMin();
        const isTouchingMin = startVertex.distance(min) === 0;
        if (isTouchingMin)
            line.color = this.getColorByAxis(startVertex, endVertex);
        else
            line.color = RGBColor.White;
        return line;
    }

    getColorByAxis(startLocation, endLocation) {
        const span = endLocation.subtract(startLocation);
        if (span.x !== 0)
            return RGBColor.Red;
        if (span.y !== 0)
            return RGBColor.Green;
        if (span.z !== 0)
            return RGBColor.Blue;
        return RGBColor.White;
    }

    drawDirectionArrow() {
        if (this.directionArrowShape)
            debugDrawer.removeShape(this.directionArrowShape);
        const arrowLocation = this.getArrowLocation();
        arrowLocation.base.dimension = this.dimension;
        const arrow = new DebugArrow(arrowLocation.base, arrowLocation.head);
        arrow.color = this.getColorByAxis(arrowLocation.base, arrowLocation.head);
        arrow.headLength = 0.3;
        arrow.headRadius = 0.15;
        arrow.headSegments = 8;
        this.directionArrowShape = arrow;
        debugDrawer.addShape(arrow);
    }

    shouldDirectionArrowMove() {
        if (!this.directionArrowShape)
            return true;
        const oldHead = Vector.from(this.directionArrowShape.endLocation);
        const arrowLocation = this.getArrowLocation();
        return oldHead.distance(arrowLocation.head) !== 0;
    }

    getArrowLocation() {
        const centerpoint = this.getCenterpoint();
        const end = centerpoint.add(this.playerMovement.getMajorDirectionFacing().multiply(3));
        return { base: centerpoint, head: end };
    }

    drawOffsetText() {
        if (this.offsetTextShape)
            debugDrawer.removeShape(this.offsetTextShape);
        const textLocation = this.getCenterpoint();
        textLocation.dimension = this.dimension;
        const textShape = new DebugText(textLocation, this.getOffsetText());
        textShape.scale = Math.max(0.85, this.playerMovement.distance(textLocation) / 20);
        this.offsetTextShape = textShape;
        debugDrawer.addShape(textShape);
    }

    getOffsetText() {
        const totalOffset = Vector.from(this.blockVolume.getMin()).subtract(this.initialVolume.getMin());
        return `<§c${totalOffset.x}, §a${totalOffset.y}, §b${totalOffset.z}§f>`;
    }
}