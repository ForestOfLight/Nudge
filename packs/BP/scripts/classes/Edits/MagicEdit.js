import { ListBlockVolume } from "@minecraft/server";
import { Edit } from "../Edits/Edit";
import { BlockBreadthFirstSearch } from "../BlockBreadthFirstSearch";
import { Vector } from "../../lib/Vector";

export class MagicEdit extends Edit {
    initialLocation;
    initialBlockType;
    connectedBlocksVolume;

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

    matchesSearch() {
        throw new Error('matchesSearch() must be implemented');
    }

    populateConnectedBlocks(location, { corners = true, maxBlocks = 128 }) {
        this.initialBlockType = this.dimension.getBlock(this.initialLocation).typeId;
        if (this.initialBlockType === 'minecraft:air')
            this.connectedBlocksVolume = new ListBlockVolume([location]);
        this.connectedBlocksVolume = new ListBlockVolume([location]);
        const bfs = new BlockBreadthFirstSearch(this.dimension);
        const bfsOptions = { corners, maxFound: maxBlocks };
        const connectedBlocks = bfs.run(this.initialLocation, this.matchesSearch.bind(this), bfsOptions);
        this.connectedBlocksVolume.add(connectedBlocks);
    }

    getBlocksAsStructures() {
        const structures = [];
        const blockLocationIterator = this.connectedBlocksVolume.getBlockLocationIterator();
        let iteratorResult = blockLocationIterator.next();
        while (iteratorResult.done === false) {
            const location = iteratorResult.value;
            structures.push(this.createSingleStructure(location, location, { includeEntities: false }));
            iteratorResult = blockLocationIterator.next();
        }
        return structures;
    }

    clearConnectedBlocks(clearLocation = void 0) {
        const blockLocationIterator = this.connectedBlocksVolume.getBlockLocationIterator();
        let iteratorResult = blockLocationIterator.next();
        let clearOffset = new Vector();
        if (clearLocation)
            clearOffset = Vector.from(clearLocation).subtract(this.initialLocation);
        while (iteratorResult.done === false) {
            const location = Vector.from(iteratorResult.value).add(clearOffset);
            this.dimension.setBlockType(location, 'minecraft:air');
            iteratorResult = blockLocationIterator.next();
        }
    }

    pasteBlockStructures(blockStructures, pasteLocation = void 0) {
        const blockLocationIterator = this.connectedBlocksVolume.getBlockLocationIterator();
        let iteratorResult = blockLocationIterator.next();
        let pasteOffset = new Vector();
        if (pasteLocation)
            pasteOffset = Vector.from(pasteLocation).subtract(this.initialLocation);
        for (const blockStructure of blockStructures) {
            if (iteratorResult.done)
                throw new Error('Number of saved block structures does not match number of connected blocks.');
            const location = Vector.from(iteratorResult.value).add(pasteOffset);
            this.pasteSingleStructure(blockStructure, location);
            iteratorResult = blockLocationIterator.next();
        }
    }
}