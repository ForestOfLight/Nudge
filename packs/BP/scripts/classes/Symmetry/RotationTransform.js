import { SymmetricTransform } from "./SymmetricTransform";
import { StructureMirrorAxis, StructureRotation } from "@minecraft/server";
import { Vector } from "../../lib/Vector";

export class RotationTransform extends SymmetricTransform {
    getTransforms() {
        return [
            { 
                newLocation: this.symmetryLocation.add(new Vector(-this.interactionOffset.z - 1, this.interactionOffset.y, this.interactionOffset.x)), 
                mirror: StructureMirrorAxis.None,
                rotation: StructureRotation.Rotate90
            },
            { 
                newLocation: this.symmetryLocation.add(new Vector(-this.interactionOffset.x - 1, this.interactionOffset.y, -this.interactionOffset.z - 1)), 
                mirror: StructureMirrorAxis.None,
                rotation: StructureRotation.Rotate180
            },
            { 
                newLocation: this.symmetryLocation.add(new Vector(this.interactionOffset.z, this.interactionOffset.y, -this.interactionOffset.x - 1)), 
                mirror: StructureMirrorAxis.None,
                rotation: StructureRotation.Rotate270
            }
        ];
    }
}