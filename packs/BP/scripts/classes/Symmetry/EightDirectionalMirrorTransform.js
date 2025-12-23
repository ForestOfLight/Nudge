import { SymmetricTransform } from "./SymmetricTransform";
import { StructureMirrorAxis, StructureRotation } from "@minecraft/server";
import { Vector } from "../../lib/Vector";

export class EightDirectionalMirrorTransform extends SymmetricTransform {
    getTransforms() {
        const rotations = [void 0, StructureRotation.Rotate90, StructureRotation.Rotate180, StructureRotation.Rotate270];
        const mirrors = [StructureMirrorAxis.None, StructureMirrorAxis.X];
        const results = [];
        const seen = new Set();

        for (const mirror of mirrors) {
            for (const rotation of rotations) {
                let rotated = new Vector(this.interactionOffset.x, this.interactionOffset.y, this.interactionOffset.z);
                switch (rotation) {
                    case StructureRotation.Rotate90:
                        rotated = new Vector(-this.interactionOffset.z - 1, this.interactionOffset.y, this.interactionOffset.x);
                        break;
                    case StructureRotation.Rotate180:
                        rotated = new Vector(-this.interactionOffset.x - 1, this.interactionOffset.y, -this.interactionOffset.z - 1);
                        break;
                    case StructureRotation.Rotate270:
                        rotated = new Vector(this.interactionOffset.z, this.interactionOffset.y, -this.interactionOffset.x - 1);
                        break;
                    default:
                        break;
                }

                let mirrored = new Vector(rotated.x, rotated.y, rotated.z);
                if (mirror === StructureMirrorAxis.X)
                    mirrored = new Vector(rotated.x, rotated.y, -rotated.z - 1);
                if (mirror === StructureMirrorAxis.Z)
                    mirrored = new Vector(-rotated.x - 1, rotated.y, rotated.z);

                let mirrorAxis = void 0;
                if (mirror !== StructureMirrorAxis.None) {
                    if (mirror === StructureMirrorAxis.X) {
                        if (rotation === StructureRotation.Rotate90 || rotation === StructureRotation.Rotate270)
                            mirrorAxis = StructureMirrorAxis.Z;
                        else
                            mirrorAxis = StructureMirrorAxis.X;
                    } else {
                        mirrorAxis = mirror;
                    }
                }

                const newLocation = this.symmetryLocation.add(mirrored).floor();
                if (seen.has(newLocation.toString()))
                    continue;
                seen.add(newLocation.toString());
                results.push({ newLocation, mirrorAxis, rotation });
            }
        }
        return results;
    }
}