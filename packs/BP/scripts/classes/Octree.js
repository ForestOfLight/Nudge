import { Vector } from "../lib/Vector";

const TopLeftFront = 0;
const TopRightFront = 1;
const BottomRightFront = 2;
const BottomLeftFront = 3;
const TopLeftBottom = 4;
const TopRightBottom = 5;
const BottomRightBack = 6;
const BottomLeftBack = 7;

export class Octree {
    point = null;
    min;
    max;
    children;
    
    constructor(min = void 0, max = void 0) {
        if (!min && !max) {
            this.point = 'EmptyLeaf';
            return;
        } else if (!max) {
            this.point = new Vector(min);
            return;
        }

        if (max.x < min.x || max.y < min.y || max.z < min.z) {
            console.log("Leaf points are invalid");
            return;
        }
        this.point = 'Internal';
        this.min = new Vector(min);
        this.max = new Vector(max);
        
        for (let i = TopLeftFront; i <= BottomLeftBack; i++)
            this.children[i] = new Octree();
    }

    subdivideToSize(node, targetSize) {
        if (!node || !this.isInternalNode(node))
            return;

        const min = node.min, max = node.max;
        const size = max.subtract(min).add(new Vector(1, 1, 1));
        const maxEdge = Math.max(size.x, size.y, size.z);
        if (maxEdge <= targetSize)
            return;

        const mid = this.getMid(min, max);
        for (let i = 0; i < 8; i++) {
            const potentialChild = this.getNewInternalNode(i, mid)
            if (potentialChild.min.x > potentialChild.max.x || potentialChild.min.y > potentialChild.max.y || potentialChild.min.z > potentialChild.max.z)
                continue;
            const child = node.children[i];
            if (!child || this.isEmptyLeafNode(child)) {
                node.children[i] = potentialChild;
            } else if (!this.isInternalNode(child) && child.point instanceof Vector) {
                // a point leaf — replace with internal region then reinsert point if needed
                const existingPoint = child.point;
                node.children[i] = potentialChild;
                node.children[i].insert(existingPoint);
            }
            subdivideToSize(node.children[i], targetSize);
        }
    }

    collectLeaves(node, out = []) {
        if (!node) return out;
        if (this.isInternalNode(node)) {
            for (let c of node.children)
                collectLeaves(c, out);
        } else {
            if (node.min && node.max)
                out.push({ min: node.min, max: node.max });
        }
        return out;
    }

    insert(vec) {
        if (this.find(vec)) {
            console.log("Point already exists in the tree");
            return;
        }

        if (!this.isWithinBounds(vec)) {
            console.log("Point is out of bounds");
            return;
        }

        const mid = this.getMid(this.min, this.max);
        let pos = -1;
        if (vec.x <= mid.x) {
            if (vec.y <= mid.y) {
                pos = vec.z <= mid.z ? TopLeftFront : TopLeftBottom;
            } else {
                pos = vec.z <= mid.z ? BottomLeftFront : BottomLeftBack;
            }
        } else {
            if (vec.y <= mid.y) {
                pos = vec.z <= mid.z ? TopRightFront : TopRightBottom;
            } else {
                pos = vec.z <= mid.z ? BottomRightFront : BottomRightBack;
            }
        }

        if (this.isInternalNode(this.children[pos])) {
            this.children[pos].insert(vec);
        } else if (this.isEmptyLeafNode(this.children[pos])) {
            this.children[pos] = new Octree(vec);
        } else {
            const vecCopy = this.children[pos].point;
            this.children[pos] = this.getNewInternalNode(pos, mid);
            this.children[pos].insert(vecCopy);
            this.children[pos].insert(vec);
        }
    }

    find(vec) {
        if (!this.min || !this.max)
            return false;

        if (!this.isWithinBounds(vec)) {
            return false;
        }

        const mid = this.getMid(this.min, this.max);
        let pos = -1;
        if (x <= mid.x) {
            if (y <= mid.y) {
                pos = z <= mid.z ? TopLeftFront : TopLeftBottom;
            } else {
                pos = z <= mid.z ? BottomLeftFront : BottomLeftBack;
            }
        } else {
            if (y <= mid.y) {
                pos = z <= mid.z ? TopRightFront : TopRightBottom;
            } else {
                pos = z <= mid.z ? BottomRightFront : BottomRightBack;
            }
        }

        if (this.isInternalNode(this.children[pos])) {
            return this.children[pos].find(vec);
        } else if (this.isEmptyLeafNode(this.children[pos])) {
            return false;
        } else {
            return vec.x === this.children[pos].point.x
                && vec.y === this.children[pos].point.y
                && vec.z === this.children[pos].point.z;
        }
    }

    getNewInternalNode(pos, mid) {
        switch (pos) {
            case TopLeftFront:
                return new Octree(this.min, mid);
            case TopRightFront:
                return new Octree(new Vector(mid.x+1, this.min.y, this.min.z), new Vector(this.max.x, mid.y, mid.z));
            case BottomRightFront:
                return new Octree(new Vector(mid.x+1, mid.y+1, this.min.z), new Vector(this.max.x, this.max.y, mid.z));
            case BottomLeftFront:
                return new Octree(new Vector(this.min.x, mid.y+1, this.min.z), new Vector(mid.x, this.max.y, mid.z));
            case TopLeftBottom:
                return new Octree(new Vector(this.min.x, this.min.y, mid.z+1), new Vector(mid.x, mid.y, this.max.z));
            case TopRightBottom:
                return new Octree(new Vector(mid.x+1, this.min.y, mid.z+1), new Vector(this.max.x, mid.y, this.max.z));
            case BottomRightBack:
                return new Octree(new Vector(mid.x+1, mid.y+1, mid.z+1), new Vector(this.max.x, this.max.y, this.max.z));
            case BottomLeftBack:
                return new Octree(new Vector(this.min.x, mid.y + 1, mid.z + 1), new Vector(mid.x, this.max.y, this.max.z));
        }
    }

    isWithinBounds(vec) {
        return vec.x > this.min.x && vec.x < this.max.x
            && vec.y > this.min.y && vec.y < this.max.y
            && vec.z > this.min.z && vec.z < this.max.z;
    }

    getMid(min, max) {
        return Math.floor(min.add(max).multiply(0.5));
    }

    isInternalNode(node) {
        return node.point === 'Internal';
    }

    isEmptyLeafNode(node) {
        return node.point === 'EmptyLeaf';
    }
}