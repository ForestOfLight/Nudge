import { SymmetricTransform } from "./SymmetricTransform";
import { StructureMirrorAxis, StructureRotation } from "@minecraft/server";
import { Vector } from "../../lib/Vector";

export class MirrorZTransform extends SymmetricTransform {
    getTransforms() {
        return [
            { 
                newLocation: this.symmetryLocation.add(new Vector(this.interactionOffset.x * -1 - 1, this.interactionOffset.y, this.interactionOffset.z)), 
                mirrorAxis: StructureMirrorAxis.Z, 
                rotation: StructureRotation.None
            }
        ];
    }
}