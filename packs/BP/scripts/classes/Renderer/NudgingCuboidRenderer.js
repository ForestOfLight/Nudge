import { DebugBox, debugDrawer, DebugLine, DebugArrow } from "@minecraft/debug-utilities";
import { Vector } from "../../lib/Vector";
import { system } from "@minecraft/server";
import { CuboidRenderer } from "./CuboidRenderer";

export class NudgingCuboidRenderer extends CuboidRenderer {
    playerMovement;
    blockLocations = {};
    shouldStop = false;
    drawBuildRunner = null;
    shapes = [];
    movementDirectionArrowShape;

    constructor(min, max, playerMovement) {
        super(min, max);
        this.playerMovement = playerMovement;
        this.drawCuboid();
    }

    destroy() {
        this.shouldStop = true;
        // system.clearJob(this.drawBuildRunner);
        this.shapes.forEach(shape => debugDrawer.removeShape(shape));
        debugDrawer.removeShape(this.movementDirectionArrowShape);
        this.shapes = [];
    }

    setLocation(min, max) {
        if (this.arrowShouldMove(min, max))
            this.drawMovementDirectionArrow();
        const oldMin = this.blockVolume.getMin();
        const oldMax = this.blockVolume.getMax();
        if (min.distance(oldMin) === 0 && max.distance(oldMax) === 0)
            return;
        super.setLocation(min, max);
    }

    drawCuboid() {
        this.shapes.forEach(shape => {
            debugDrawer.removeShape(shape);
        });
        this.getMovingCuboidEdgeShapes().forEach(shape => {
            this.drawShape(shape);
        });
    }

    drawBuild(blockLocations) {
        this.blockLocations = blockLocations;
        // this.drawRunner = system.runJob(this.greedyMeshBiomeEdgeLocations());
    }
    
    drawShape(shape) {
        this.shapes.push(shape);
        debugDrawer.addShape(shape);
    }

    *greedyMeshBiomeEdgeLocations() {
        for (let axis = 0; axis < 3; axis++)
            this.drawOriginalCuboid();
            yield* this.drawAxisEdges(axis);
    }
    
    *drawAxisEdges(axis) {
        const span = [this.blockVolume.getSpan().x, this.blockVolume.getSpan().y, this.blockVolume.getSpan().z];
        const middleAxis = (axis + 1) % 3;
        const finalAxis = (axis + 2) % 3;
        const localLocation = [0, 0, 0];
        const searchDirection = [0, 0, 0];
        searchDirection[axis] = 1;

        localLocation[axis] = -1;
        while (localLocation[axis] < span[axis]) {
            const mask = this.buildMask(localLocation, middleAxis, finalAxis, span, searchDirection);
            yield void 0;
            localLocation[axis]++;
            yield* this.generateMeshFromMask(mask, middleAxis, finalAxis, span, localLocation);
        }
    }

    buildMask(localLocation, middleAxis, finalAxis, span, searchDirection) {
        const mask = [];
        let maskIndex = 0;
        const volumeLocation = this.blockVolume.getMin();
        for (localLocation[finalAxis] = 0; localLocation[finalAxis] < span[finalAxis]; ++localLocation[finalAxis]) {
            for (localLocation[middleAxis] = 0; localLocation[middleAxis] < span[middleAxis]; ++localLocation[middleAxis]) {
                const currentBiome = this.isBlockAt({
                    x: localLocation[0] + volumeLocation.x,
                    y: localLocation[1] + volumeLocation.y,
                    z: localLocation[2] + volumeLocation.z
                });
                const nextBlockBiome = this.isBlockAt({
                    x: localLocation[0] + searchDirection[0] + volumeLocation.x,
                    y: localLocation[1] + searchDirection[1] + volumeLocation.y,
                    z: localLocation[2] + searchDirection[2] + volumeLocation.z
                });
                if (currentBiome === void 0 || nextBlockBiome === void 0) {
                    mask[maskIndex++] = false;
                    continue;
                }
                mask[maskIndex++] = currentBiome !== nextBlockBiome;
            }
        }
        return mask;
    }

    *generateMeshFromMask(mask, middleAxis, finalAxis, span, localLocation) {
        let maskIndex = 0;
        for (let finalAxisIndex = 0; finalAxisIndex < span[finalAxis]; ++finalAxisIndex) {
            let middleAxisIndex = 0;
            while (middleAxisIndex < span[middleAxis]) {
                if (this.shouldStop)
                    return;
                if (mask[maskIndex]) {
                    const { quadWidth, quadHeight } = this.findQuad(mask, maskIndex, middleAxisIndex, finalAxisIndex, span, middleAxis, finalAxis);
                    localLocation[middleAxis] = middleAxisIndex;
                    localLocation[finalAxis] = finalAxisIndex;
                    this.drawQuad(localLocation, middleAxis, finalAxis, quadWidth, quadHeight);

                    this.clearMaskOfQuad(mask, maskIndex, quadWidth, quadHeight, span[middleAxis]);
                    middleAxisIndex += quadWidth;
                    maskIndex += quadWidth;
                } else {
                    middleAxisIndex++;
                    maskIndex++;
                }
                yield void 0;
            }
        }
    }

    findQuad(mask, maskIndex, middleAxisIndex, finalAxisIndex, span, middleAxis, finalAxis) {
        let quadWidth = 1;
        while (middleAxisIndex + quadWidth < span[middleAxis] && mask[maskIndex + quadWidth])
            quadWidth++;

        let quadHeight = 1;
        let done = false;
        while (finalAxisIndex + quadHeight < span[finalAxis]) {
            for (let k = 0; k < quadWidth; k++) {
                if (!mask[maskIndex + k + quadHeight * span[middleAxis]]) {
                    done = true;
                    break;
                }
            }
            if (done)
                break;
            quadHeight++;
        }
        return { quadWidth, quadHeight };
    }

    clearMaskOfQuad(mask, maskIndex, quadWidth, quadHeight, stride) {
        for (let i = 0; i < quadHeight; i++) {
            for (let j = 0; j < quadWidth; j++)
                mask[maskIndex + j + i * stride] = false;
        }
    }

    drawQuad(localLocation, middleAxis, finalAxis, quadWidth, quadHeight) {
        const changeInMiddleAxis = [0, 0, 0];
        changeInMiddleAxis[middleAxis] = quadWidth;
        const changeInFinalAxis = [0, 0, 0];
        changeInFinalAxis[finalAxis] = quadHeight;
        const bound = new Vector(...changeInMiddleAxis).add(new Vector(...changeInFinalAxis));
        
        const worldLocation = Vector.from(this.blockVolume.getMin()).add(new Vector(...localLocation));
        const sidedBox = new DebugBox(worldLocation);
        sidedBox.bound = bound;
        sidedBox.color = { red: 1, green: 1, blue: 1 };
        this.drawShape(sidedBox);
    }

    isBlockAt(location) {
        return this.blockLocations[Vector.from(location)];
    }
    
    getMovingCuboidEdgeShapes() {
        const min = this.blockVolume.getMin();
        const max = Vector.from(this.blockVolume.getMax()).add({ x: 1, y: 1, z: 1 });
        const vertices = this.getVertices(min, max);
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
        const line = new DebugLine(startVertex, endVertex);
        const min = this.blockVolume.getMin();
        const isTouchingMin = startVertex.distance(min) === 0;
        if (isTouchingMin)
            line.color = this.getColorByAxis(startVertex, endVertex);
        else
            line.color = { red: 1, green: 1, blue: 1 };
        return line;
    }

    getColorByAxis(startLocation, endLocation) {
        const span = endLocation.subtract(startLocation);
        if (span.x !== 0)
            return { red: 1, green: 0, blue: 0 };
        if (span.y !== 0)
            return { red: 0, green: 1, blue: 0 };
        if (span.z !== 0)
            return { red: 0/255, green: 162/255, blue: 255/255 };
        return { red: 1, green: 1, blue: 1};
    }

    getVertices(min, max) {
        return [
            new Vector(min.x, min.y, min.z),
            new Vector(max.x, min.y, min.z),
            new Vector(max.x, max.y, min.z),
            new Vector(min.x, max.y, min.z),
            new Vector(min.x, min.y, max.z),
            new Vector(max.x, min.y, max.z),
            new Vector(max.x, max.y, max.z),
            new Vector(min.x, max.y, max.z)
        ];
    }

    getEdges() {
        return [ // Arranged in pairs of smaller (closer to min) and larger (closer to max) vertices
            [0, 1], [0, 3], [0, 4],
            [1, 2], [3, 2], [4, 5],
            [5, 6], [7, 6], [4, 7],
            [1, 5], [2, 6], [3, 7]
        ];
    }

    drawMovementDirectionArrow() {
        if (this.movementDirectionArrowShape)
            debugDrawer.removeShape(this.movementDirectionArrowShape);
        const arrowLocation = this.getArrowLocation(this.blockVolume.getMin(), this.blockVolume.getMax());
        const arrow = new DebugArrow(arrowLocation.base, arrowLocation.head);
        arrow.color = this.getColorByAxis(arrowLocation.base, arrowLocation.head);
        arrow.headLength = 0.3;
        arrow.headRadius = 0.15;
        arrow.headSegments = 8;
        this.movementDirectionArrowShape = arrow;
        debugDrawer.addShape(arrow);
    }

    getArrowLocation(min, max) {
        const relativeCenterpoint = Vector.from(max).subtract(min).add(new Vector(1, 1, 1)).multiply(0.5);
        const centerpoint = Vector.from(min).add(relativeCenterpoint);
        const end = centerpoint.add(this.playerMovement.getMajorDirectionFacing().multiply(3));
        return { base: centerpoint, head: end };
    }

    arrowShouldMove(min, max) {
        if (!this.movementDirectionArrowShape)
            return true;
        const oldHead = Vector.from(this.movementDirectionArrowShape.endLocation);
        const arrowLocation = this.getArrowLocation(min, max);
        return oldHead.distance(arrowLocation.head) !== 0;
    }
}