import { Vector } from '../lib/Vector';

export class BlockBreadthFirstSearch {
    dimension;
    queue;
    visited;
    result;

    constructor(dimension) {
        this.dimension = dimension;
        this.queue = [];
        this.visited = new Set();
        this.result = [];
    }

    makeKey(location) {
        return `${location.x}|${location.y}|${location.z}`;
    }

    run(location, isSameTypeCallback, { corners = false, maxFound = 128 } = {}) {
        this.queue.length = 0;
        this.visited.clear();
        this.result.length = 0;
        location = Vector.from(location);

        this.queue.push(location);
        this.visited.add(this.makeKey(location));

        for (let i = 0; i < this.queue.length; i++) {
            if (this.result.length > maxFound)
                return this.result;
            const queuedLocation = this.queue[i];
            this.result.push(queuedLocation);

            const directions = [
                Vector.up,
                Vector.down,
                Vector.left,
                Vector.right,
                Vector.forward,
                Vector.backward
            ];
            for (const direction of directions) {
                this.tryVisit(queuedLocation.add(direction), isSameTypeCallback);
            }
            if (corners) {
                const directions = [
                    [Vector.up, Vector.left],
                    [Vector.up, Vector.right],
                    [Vector.up, Vector.forward],
                    [Vector.up, Vector.backward],
                    [Vector.down, Vector.left],
                    [Vector.down, Vector.right],
                    [Vector.down, Vector.forward],
                    [Vector.down, Vector.backward],
                    [Vector.left, Vector.forward],
                    [Vector.left, Vector.backward],
                    [Vector.right, Vector.forward],
                    [Vector.right, Vector.backward],
                    [Vector.up, Vector.left, Vector.forward],
                    [Vector.up, Vector.left, Vector.backward],
                    [Vector.up, Vector.right, Vector.forward],
                    [Vector.up, Vector.right, Vector.backward],
                    [Vector.down, Vector.left, Vector.forward],
                    [Vector.down, Vector.left, Vector.backward],
                    [Vector.down, Vector.right, Vector.forward],
                    [Vector.down, Vector.right, Vector.backward],
                ];
                for (const directionSet of directions) {
                    let offset = queuedLocation;
                    for (const direction of directionSet) {
                        offset = offset.add(direction);
                    }
                    this.tryVisit(offset, isSameTypeCallback);
                }
            }
        }

        return this.result;
    }

    tryVisit(location, isSameTypeCallback) {
        const k = this.makeKey(location);
        if (this.visited.has(k))
            return;
        const heightRange = this.dimension.heightRange;
        if (location.y < heightRange.min || location.y >= heightRange.max)
            return;
        const block = this.dimension.getBlock(location);
        if (!block || !isSameTypeCallback(block))
            return;
        this.visited.add(k);
        this.queue.push(location);
    }
}
