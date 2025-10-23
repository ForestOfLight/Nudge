import { BlockVolume } from "@minecraft/server";
import { Vector } from "../lib/Vector";

export class VolumePartitioner {
    constructor(blockVolume, partitionSize) {
        this.blockVolume = blockVolume;
        this.partitionSize = partitionSize;
        this.min = this.blockVolume.getMin();
        this.max = this.blockVolume.getMax();
    }

    getPartitions() {
        const partitions = [];
        for (let y = this.min.y; y <= this.max.y; y += this.partitionSize)
            partitions.push(...this.getPartitionsLayer(y))
        return partitions;
    }

    getPartitionsLayer(y) {
        const layerPartitions = [];
        for (let x = this.min.x; x <= this.max.x; x += this.partitionSize) {
            for (let z = this.min.z; z <= this.max.z; z += this.partitionSize)
                layerPartitions.push(this.getPartitionAt(x, y, z));
        }
        return layerPartitions;
    }

    getPartitionAt(x, y, z) {
        const partitionMin = new Vector(x, y, z);
        const partitionMax = new Vector(
            Math.min(x + this.partitionSize, this.max.x),
            Math.min(y + this.partitionSize, this.max.y),
            Math.min(z + this.partitionSize, this.max.z)
        )
        return new BlockVolume(partitionMin, partitionMax);
    }
}