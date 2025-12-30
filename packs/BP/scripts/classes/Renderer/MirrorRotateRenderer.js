import { StructureMirrorAxis, StructureRotation } from "@minecraft/server";
import { debugDrawer, DebugLine, DebugArrow } from "@minecraft/debug-utilities";
import { Vector } from "../../lib/Vector";
import { RGBColor } from "./RGBColor";

export class MirrorRotateRenderer {
    dimension;
    location;
    mirrorAxis;
    rotation;
    shapes = [];

    constructor(dimension, location, { mirrorAxis = StructureMirrorAxis.None, rotation = StructureRotation.None } = {}) {
        this.dimension = dimension;
        this.mirrorAxis = mirrorAxis;
        this.rotation = rotation;
        this.setLocation(location);
    }

    destroy() {
        this.shapes.forEach(shape => debugDrawer.removeShape(shape));
        this.shapes.length = 0;
    }

    setLocation(location) {
        this.location = Vector.from(location);
        this.draw();
    }
    
    setMirrorAxis(structureMirrorAxis) {
        this.mirrorAxis = structureMirrorAxis;
    }

    setRotation(structureRotation) {
        this.rotation = structureRotation;
    }

    draw() {
        this.shapes.forEach(shape => debugDrawer.removeShape(shape));
        this.shapes.length = 0;
        this.getMirrorShapes().forEach(shape => this.drawShape(shape));
        this.getRotationShapes().forEach(shape => this.drawShape(shape));
    }

    drawShape(shape) {
        this.shapes.push(shape);
        debugDrawer.addShape(shape);
    }

    getMirrorShapes() {
        switch(this.mirrorAxis) {
            case StructureMirrorAxis.X:
                return this.getXMirrorShapes();
            case StructureMirrorAxis.Z:
                return this.getZMirrorShapes();
            case StructureMirrorAxis.XZ:
                return [...this.getXMirrorShapes(), ...this.getZMirrorShapes()];
            default:
                return [];
        }
    }

    getXMirrorShapes() {
        const shapes = [
            new DebugLine({ ...this.location.add(new Vector(0, 0, 0.25)), dimension: this.dimension }, this.location.add(new Vector(0, 2, 0.25))),
            new DebugLine({ ...this.location.add(new Vector(0, 0, 1)), dimension: this.dimension }, this.location.add(new Vector(0, 2, 0.25))),
            new DebugLine({ ...this.location.add(new Vector(0, 0, 1)), dimension: this.dimension }, this.location.add(new Vector(0, 0, 0.25))),
            new DebugLine({ ...this.location.add(new Vector(0, 0, -0.25)), dimension: this.dimension }, this.location.add(new Vector(0, 2, -0.25))),
            new DebugLine({ ...this.location.add(new Vector(0, 0, -1)), dimension: this.dimension }, this.location.add(new Vector(0, 2, -0.25))),
            new DebugLine({ ...this.location.add(new Vector(0, 0, -1)), dimension: this.dimension }, this.location.add(new Vector(0, 0, -0.25)))
        ]
        shapes.forEach(shape => {
            shape.setLocation(shape.location);
            shape.endLocation = shape.endLocation;
            shape.color = RGBColor.Red;
        });
        return shapes;
    }

    getZMirrorShapes() {
        const shapes = [
            new DebugLine({ ...this.location.add(new Vector(0.25, 0, 0)), dimension: this.dimension }, this.location.add(new Vector(0.25, 2, 0))),
            new DebugLine({ ...this.location.add(new Vector(1, 0, 0)), dimension: this.dimension }, this.location.add(new Vector(0.25, 2, 0))),
            new DebugLine({ ...this.location.add(new Vector(1, 0, 0)), dimension: this.dimension }, this.location.add(new Vector(0.25, 0, 0))),
            new DebugLine({ ...this.location.add(new Vector(-0.25, 0, 0)), dimension: this.dimension }, this.location.add(new Vector(-0.25, 2, 0))),
            new DebugLine({ ...this.location.add(new Vector(-1, 0, 0)), dimension: this.dimension }, this.location.add(new Vector(-0.25, 2, 0))),
            new DebugLine({ ...this.location.add(new Vector(-1, 0, 0)), dimension: this.dimension }, this.location.add(new Vector(-0.25, 0, 0)))
        ]
        shapes.forEach(shape => {
            shape.setLocation(shape.location);
            shape.endLocation = shape.endLocation;
            shape.color = RGBColor.Blue;
        });
        return shapes;
    }

    getRotationShapes() {
        const shapes = [];
        switch (this.rotation) {
            case true:
                shapes.push(...this.createCurvedLine(
                    this.location.add(new Vector(0, 0, -2)),
                    this.location.add(new Vector(2, 0, 0))
                ));
            case StructureRotation.Rotate270:
                shapes.push(...this.createCurvedLine(
                    this.location.add(new Vector(-2, 0, 0)),
                    this.location.add(new Vector(0, 0, -2))
                ));
            case StructureRotation.Rotate180:
                shapes.push(...this.createCurvedLine(
                    this.location.add(new Vector(0, 0, 2)),
                    this.location.add(new Vector(-2, 0, 0))
                ));
            case StructureRotation.Rotate90:
                shapes.push(...this.createCurvedLine(
                    this.location.add(new Vector(2, 0, 0)),
                    this.location.add(new Vector(0, 0, 2))
                ));
                break;
            default:
                break;
        }
        shapes.forEach(shape => {
            shape.setLocation(shape.location);
            shape.endLocation = shape.endLocation;
            shape.headLength = 0.3;
            shape.headRadius = 0.15;
            shape.headSegments = 8;
            shape.color = RGBColor.Green;
        });
        return shapes;
    }

    createCurvedLine(start, end, curveDistance = 1.25, segments = 8) {
        const lines = [];
        const center = start.add(end).multiply(0.5);
        const dir = start.subtract(center).normalized;
        const perp = new Vector(-dir.z, 0, dir.x).normalized;
        const control = center.add(perp.multiply(curveDistance));
        for (let i = 0; i < segments; i++) {
            const t1 = i / segments;
            const t2 = (i + 1) / segments;
            // Quadratic Bezier curve: B(t) = (1-t)^2 * start + 2*(1-t)*t*control + t^2 * end
            const p1 = start.multiply((1 - t1) * (1 - t1))
                .add(control.multiply(2 * (1 - t1) * t1))
                .add(end.multiply(t1 * t1));
            const p2 = start.multiply((1 - t2) * (1 - t2))
                .add(control.multiply(2 * (1 - t2) * t2))
                .add(end.multiply(t2 * t2));
            p1.dimension = this.dimension;
            if (i === segments - 1)
                lines.push(new DebugArrow(p1, p2));
            else
                lines.push(new DebugLine(p1, p2));
        }
        return lines;
    }
}