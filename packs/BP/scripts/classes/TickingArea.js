import { BlockVolume, system, world } from "@minecraft/server";
import { Vector } from "../lib/Vector";
import { debugDrawer, DebugBox } from "@minecraft/debug-utilities";
import { toChunkCoords } from "../utils";
import { IDGenerator } from "./IDGenerator";

const LOADER_RADIUS = 2;
const LOADER_DIAMETER = LOADER_RADIUS * 2 + 1;

export class TickingArea {
    dimension;
    cuboid;
    loaderEntities = [];
    isLoadedChecker = void 0;
    shouldStopChecking = false;
    tickingAreaID = void 0;

    constructor(dimension, from, to) {
        this.dimension = dimension;
        this.cuboid = new BlockVolume(from, to);
    }

    async load() {
        const entityLocations = this.getEntityLocations();

        // Remove the tickingarea once https://report.bugs.mojang.com/servicedesk/customer/portal/6/MCPE-229817 is fixed.
        const firstEntityLocation = entityLocations[0];
        this.tickingAreaID = IDGenerator.getNext().replace(':', '-');
        this.dimension.runCommand(`/tickingarea add circle ${firstEntityLocation.x} ${firstEntityLocation.y} ${firstEntityLocation.z} 1 ${this.tickingAreaID} true`);

        this.spawnLoaderEntities(entityLocations);
        return new Promise(async (resolve) => this.entitiesAreLoaded(resolve));
    }

    unload() {
        for (const entity of this.loaderEntities)
            entity?.remove();
        this.loaderEntities = [];
        this.shouldStopChecking = true;
    }

    async entitiesAreLoaded(resolve) {
        system.runTimeout(() => {
            this.isLoadedChecker = system.runInterval(() => this.hasLoaded(resolve), 1);
        }, 5); // This Timeout is a hack solution to the problem of the tickingarea succeeding the isLoaded() check too early for the entities to actually load the area.
    }

    async hasLoaded(resolve) {
        const firstLoaderEntity = this.loaderEntities[0];
        if (firstLoaderEntity?.dimension.isChunkLoaded(firstLoaderEntity.location) || this.shouldStopChecking) {
            system.clearRun(this.isLoadedChecker);
            this.shouldStopChecking = false;
            this.dimension.runCommand(`/tickingarea remove ${this.tickingAreaID}`);
            resolve();
        }
    }
    
    getEntityLocations() {
        const entityLocations = [];
        const minChunk = toChunkCoords(this.cuboid.getMin());
        const maxChunk = toChunkCoords(this.cuboid.getMax());
        const startX = minChunk.x + LOADER_RADIUS < maxChunk.x ? minChunk.x + LOADER_RADIUS : minChunk.x;
        const startZ = minChunk.z + LOADER_RADIUS < maxChunk.z ? minChunk.z + LOADER_RADIUS : minChunk.z;
        for (let x = startX; x <= maxChunk.x; x += LOADER_RADIUS) {
            for (let z = startZ; z <= maxChunk.z; z += LOADER_RADIUS) {
                let chunkLocation = new Vector(x, 0, z);
                chunkLocation = this.shiftBackInsideCuboid(x, z, chunkLocation, maxChunk);
                entityLocations.push(chunkLocation.multiply(16));
            }
        }
        return entityLocations;
    }

    shiftBackInsideCuboid(x, z, chunkLocation, maxChunk) {
        if (x > maxChunk.x)
            chunkLocation.x = maxChunk.x - LOADER_RADIUS;
        if (z > maxChunk.z)
            chunkLocation.z = maxChunk.z - LOADER_RADIUS;
        return chunkLocation;
    }

    spawnLoaderEntities(entityLocations) {
        for(const location of entityLocations)
            this.spawnLoaderEntity(location);
    }

    spawnLoaderEntity(location) {
        const onlinePlayer = world.getAllPlayers()[0];
        const loaderEntity = onlinePlayer.dimension.spawnEntity('simpleaxiom:loader', onlinePlayer.location);
        system.runTimeout(() => {
            loaderEntity.teleport(location, { dimension: this.dimension });
            this.loaderEntities.push(loaderEntity);
            const display = new DebugBox(loaderEntity.location);
            debugDrawer.addShape(display);
            this.loaderEntities.push(display);
        }, 1);
    }

    static isVolumeLoaded(dimension, blockVolume) {
        const minChunk = toChunkCoords(blockVolume.getMin());
        const maxChunk = toChunkCoords(blockVolume.getMax());
        for (let x = minChunk.x; x <= maxChunk.x; x++) {
            for (let z = minChunk.z; z <= maxChunk.z; z++) {
                if (!dimension.isChunkLoaded({ x: x*16, y: 0, z: z*16}))
                    return false;
            }
        }
        return true;
    }
}