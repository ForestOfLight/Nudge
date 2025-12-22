import { StructureMirrorAxis, StructureSaveMode, system, world } from "@minecraft/server";
import { SymmetryRenderer } from "./SymmetryRenderer";
import { Vector } from "../../lib/Vector";
import { IDGenerator } from "../IDGenerator";
import { Builders } from "../Builders";

export class Symmetry {
    builder;
    dimension;
    location;
    mirrorAxis = StructureMirrorAxis.None;
    renderer = void 0;
    effectiveRange = 256;
    tickingAreas = [];
    interactedThisTick;

    constructor(builder, mirrorAxis) {
        this.builder = builder;
        const player = builder.getPlayer();
        this.dimension = player.dimension;
        this.location = new Vector(
            Math.round(player.location.x * 2) / 2,
            Math.floor(player.location.y),
            Math.round(player.location.z * 2) / 2
        );
        this.mirrorAxis = mirrorAxis;
        this.render();
        this.onPlayerPlaceBreakOrInteractWithBlockBound = this.onPlayerPlaceBreakOrInteractWithBlock.bind(this);
        this.subscribeToEvents();
    }

    destroy() {
        this.renderer?.destroy();
        this.unsubscribeFromEvents();
    }

    setMirrorAxis(mirrorAxis) {
        this.mirrorAxis = mirrorAxis;
        this.render();
    }

    render() {
        if (this.renderer)
            this.renderer.destroy();
        this.renderer = new SymmetryRenderer(this.dimension, this.location, this.mirrorAxis);
    }

    subscribeToEvents() {
        world.afterEvents.playerPlaceBlock.subscribe(this.onPlayerPlaceBreakOrInteractWithBlockBound);
        world.afterEvents.playerBreakBlock.subscribe(this.onPlayerPlaceBreakOrInteractWithBlockBound);
        world.afterEvents.playerInteractWithBlock.subscribe(this.onPlayerPlaceBreakOrInteractWithBlockBound);
    }

    unsubscribeFromEvents() {
        world.afterEvents.playerPlaceBlock.unsubscribe(this.onPlayerPlaceBreakOrInteractWithBlockBound);
        world.afterEvents.playerBreakBlock.unsubscribe(this.onPlayerPlaceBreakOrInteractWithBlockBound);
        world.afterEvents.playerInteractWithBlock.unsubscribe(this.onPlayerPlaceBreakOrInteractWithBlockBound);
    }

    onPlayerPlaceBreakOrInteractWithBlock(event) {
        if (event.player.id !== this.builder.getPlayer().id)
            return;
        if (this.interactedThisTick)
            return;
        this.interactedThisTick = true;
        system.run(() => this.interactedThisTick = false);
        const block = event.block;
        this.tryApplySymmetry(block);
    }

    tryApplySymmetry(block) {
        if (!this.isInEffectiveRange(block.location))
            return;
        this.mirrorAcross(block);
    }

    isInEffectiveRange(location) {
        return this.location.distance(location) < this.effectiveRange;
    }

    async mirrorAcross(block) {
        const interactionLocation = block.location;
        await this.loadArea(interactionLocation, interactionLocation);
        const structure = this.createSingleStructure(interactionLocation, interactionLocation);
        const mirrorableLocations = this.getMirroredLocations(interactionLocation);
        for (const { newLocation, mirrorAxis } of mirrorableLocations) {
            if (Vector.distance(interactionLocation, newLocation) === 0)
                continue;
            await this.loadArea(newLocation, newLocation);
            this.pasteSingleStructure(structure, newLocation, mirrorAxis);
        }
        this.unloadAreas();
    }

    getMirroredLocations(interactionLocation) {
        const offset = Vector.from(interactionLocation).subtract(this.location);
        switch (this.mirrorAxis) {
            case StructureMirrorAxis.X:
                return [{ newLocation: this.location.add(new Vector(offset.x, offset.y, offset.z * -1 - 1)), mirrorAxis: StructureMirrorAxis.X }];
            case StructureMirrorAxis.Z:
                return [{ newLocation: this.location.add(new Vector(offset.x * -1 - 1, offset.y, offset.z)), mirrorAxis: StructureMirrorAxis.Z }];
            case StructureMirrorAxis.XZ:
                return [
                    { newLocation: this.location.add(new Vector(offset.x, offset.y, offset.z * -1 - 1)), mirrorAxis: StructureMirrorAxis.X },
                    { newLocation: this.location.add(new Vector(offset.x * -1 - 1, offset.y, offset.z)), mirrorAxis: StructureMirrorAxis.Z },
                    { newLocation: this.location.add(new Vector(offset.x * -1 - 1, offset.y, offset.z * -1 - 1)), mirrorAxis: StructureMirrorAxis.XZ }
                ];
            default:
                throw new Error(`Could not get mirrored location: invalid mirror axis (${this.mirrorAxis})`);
        }
    }

    createSingleStructure(min, max, { includeEntities = true } = {}) {
        this.assertInDimensionBounds(min, max);
        const structureID = IDGenerator.getNext();
        const structureSaveOptions = { saveMode: StructureSaveMode.Memory, includeEntities: includeEntities };
        return world.structureManager.createFromWorld(structureID, this.dimension, min, max, structureSaveOptions);
    }
    
    pasteSingleStructure(structure, location, mirrorAxis = void 0, rotation = void 0) {
        const structurePlaceOptions = { mirror: mirrorAxis, rotation: rotation };
        world.structureManager.place(structure.id, this.dimension, location, structurePlaceOptions);
    }

    async loadArea(min, max) {
        const tickingAreaID = IDGenerator.getNext().replace(':', '-');
        const tickingAreaOptions = { dimension: this.dimension, from: min, to: max };
        if (!world.tickingAreaManager.hasCapacity(tickingAreaOptions))
            throw new UnloadedVolumeError("TickingArea could not be added. The area is too large or there are already too many ticking chunks.");
        this.tickingAreas.push(await world.tickingAreaManager.createTickingArea(tickingAreaID, tickingAreaOptions));
    }

    unloadAreas() {
        system.run(() => {
            this.tickingAreas.forEach(tickingArea => world.tickingAreaManager.removeTickingArea(tickingArea));
            this.tickingAreas.length = 0;
        });
    }

    assertFullyLoaded() {
        for (const tickingArea of this.tickingAreas) {
            if (!tickingArea.isFullyLoaded)
                throw new UnloadedVolumeError('The area is not completely loaded.');
        }
        return true;
    }

    assertInDimensionBounds(min, max) {
        const bounds = this.dimension.heightRange;
        if (min.y < bounds.min || max.y > bounds.max)
            throw new OutOfBoundsVolumeError('The area is partially outside of the dimension\'s height boundaries.');
        return true;
    }
}