import { SymmetricTransform } from "./SymmetricTransform";
import { StructureMirrorAxis, StructureRotation } from "@minecraft/server";
import { Vector } from "../../lib/Vector";

export class MirrorXZTransform extends SymmetricTransform {
    getTransforms() {
        return [
            { 
                newLocation: this.symmetryLocation.add(new Vector(this.interactionOffset.x, this.interactionOffset.y, this.interactionOffset.z * -1 - 1)), 
                mirrorAxis: StructureMirrorAxis.X, 
                rotation: StructureRotation.None 
            },
            { 
                newLocation: this.symmetryLocation.add(new Vector(this.interactionOffset.x * -1 - 1, this.interactionOffset.y, this.interactionOffset.z)),
                mirrorAxis: StructureMirrorAxis.Z, 
                rotation: StructureRotation.None 
            },
            { 
                newLocation: this.symmetryLocation.add(new Vector(this.interactionOffset.x * -1 - 1, this.interactionOffset.y, this.interactionOffset.z * -1 - 1)), 
                mirrorAxis: StructureMirrorAxis.XZ, 
                rotation: StructureRotation.None 
            }
        ];
    }
}