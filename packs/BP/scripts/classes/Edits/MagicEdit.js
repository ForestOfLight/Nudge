import { ListBlockVolume } from "@minecraft/server";
import { Edit } from "../Edits/Edit";
import { BlockBreadthFirstSearch } from "../BlockBreadthFirstSearch";

export class MagicEdit extends Edit {
    constructor(dimension, initialLocation) {
        super(dimension);
        this.initialLocation = initialLocation;
    }

    async do() {
        throw new Error('do() must be implemented');
    }

    async undo() {
        throw new Error('undo() must be implemented');
    }

    getDoingFeedback() {
        throw new Error('getDoingFeedback() must be implemented');
    }

    getSuccessFeedback() {
        throw new Error('getSuccessFeedback() must be implemented');
    }

    getConnectedBlocks(location) {
        this.initialBlockType = this.dimension.getBlock(this.initialLocation).typeId;
        if (this.initialBlockType === 'minecraft:air')
            return new ListBlockVolume([location]);
        const listBlockVolume = new ListBlockVolume([location]);
        const bfs = new BlockBreadthFirstSearch(this.dimension);
        const bfsOptions = { corners: true, maxFound: this.maxBlocks };
        const connectedBlocks = bfs.run(this.initialLocation, this.isSameType.bind(this), bfsOptions);
        listBlockVolume.add(connectedBlocks);
        return listBlockVolume;
    }

    getBlocksAsStructures() {
        const structures = [];
        const blockLocationIterator = this.listBlockVolume.getBlockLocationIterator();
        let iteratorResult = blockLocationIterator.next();
        while (iteratorResult.done === false) {
            const location = iteratorResult.value;
            structures.push(this.createSingleStructure(location, location, { includeEntities: false }));
            iteratorResult = blockLocationIterator.next();
        }
        return structures;
    }

    clearConnectedBlocks() {
        const blockLocationIterator = this.listBlockVolume.getBlockLocationIterator();
        let iteratorResult = blockLocationIterator.next();
        while (iteratorResult.done === false) {
            const location = iteratorResult.value;
            this.dimension.setBlockType(location, 'minecraft:air');
            iteratorResult = blockLocationIterator.next();
        }
    }

    pasteBlockStructures() {
        const blockLocationIterator = this.listBlockVolume.getBlockLocationIterator();
        for (const blockStructure of this.replacedBlockStructures) {
            const iteratorResult = blockLocationIterator.next();
            if (iteratorResult.done)
                throw new Error('Number of saved block structures does not match number of connected blocks.');
            const location = iteratorResult.value;
            this.pasteSingleStructure(blockStructure, location);
        }
    }
}