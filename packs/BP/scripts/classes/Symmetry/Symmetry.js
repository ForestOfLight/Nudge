import { StructureMirrorAxis, StructureRotation, StructureSaveMode, system, world } from "@minecraft/server";
import { SymmetryRenderer } from "./SymmetryRenderer";
import { Vector } from "../../lib/Vector";
import { IDGenerator } from "../IDGenerator";
import { TickingAreaUtils } from "../TickingAreaUtils";
import { getVectorByDirection } from "../../utils";
import { EightDirectionalMirrorTransform } from "./EightDirectionalMirrorTransform";
import { MirrorXZTransform } from "./MirrorXZTransform";
import { MirrorXTransform } from "./MirrorXTransform";
import { MirrorZTransform } from "./MirrorZTransform";
import { RotationTransform } from "./RotationTransform";

export class Symmetry {
    builder;
    dimension;
    location;
    mirrorAxis;
    rotation;
    renderer = void 0;
    effectiveRange = 256;
    interactedThisTick;

    constructor(builder, mirrorAxis = StructureMirrorAxis.None, rotation = false) {
        this.builder = builder;
        const player = builder.getPlayer();
        this.dimension = player.dimension;
        this.location = new Vector(
            Math.round(player.location.x * 2) / 2,
            Math.floor(player.location.y),
            Math.round(player.location.z * 2) / 2
        );
        this.mirrorAxis = mirrorAxis;
        this.rotation = rotation;
        this.render();
        this.onPlayerPlaceBreakOrInteractWithBlockBound = this.onPlayerPlaceBreakOrInteractWithBlock.bind(this);
        this.onEntityHitBlockBound = this.onEntityHitBlock.bind(this);
        this.onItemStartUseOnBound = this.onItemStartUseOn.bind(this);
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

    setRotation(rotation) {
        this.rotation = rotation;
        this.render();
    }

    render() {
        if (this.renderer)
            this.renderer.destroy();
        this.renderer = new SymmetryRenderer(this.dimension, this.location, { mirrorAxis: this.mirrorAxis, rotation: this.rotation });
    }

    subscribeToEvents() {
        world.afterEvents.playerPlaceBlock.subscribe(this.onPlayerPlaceBreakOrInteractWithBlockBound);
        world.afterEvents.playerBreakBlock.subscribe(this.onPlayerPlaceBreakOrInteractWithBlockBound);
        world.afterEvents.playerInteractWithBlock.subscribe(this.onPlayerPlaceBreakOrInteractWithBlockBound);
        world.afterEvents.itemStartUseOn.subscribe(this.onItemStartUseOnBound);
        world.afterEvents.entityHitBlock.subscribe(this.onEntityHitBlockBound);
    }

    unsubscribeFromEvents() {
        world.afterEvents.playerPlaceBlock.unsubscribe(this.onPlayerPlaceBreakOrInteractWithBlockBound);
        world.afterEvents.playerBreakBlock.unsubscribe(this.onPlayerPlaceBreakOrInteractWithBlockBound);
        world.afterEvents.playerInteractWithBlock.unsubscribe(this.onPlayerPlaceBreakOrInteractWithBlockBound);
        world.afterEvents.itemStartUseOn.unsubscribe(this.onItemStartUseOnBound);
        world.afterEvents.entityHitBlock.unsubscribe(this.onEntityHitBlockBound);
    }

    onEntityHitBlock(event) {
        if (!event.damagingEntity || event.damagingEntity.typeId !== 'minecraft:player')
            return;
        event.player = event.damagingEntity;
        event.block = event.hitBlock;
        this.onPlayerPlaceBreakOrInteractWithBlock(event);
    }

    onItemStartUseOn(event) {
        event.player = event.source;
        this.onPlayerPlaceBreakOrInteractWithBlock(event);
        const possibleBlockLocation = Vector.add(event.block.location, getVectorByDirection(event.blockFace));
        const possibleBlock = this.dimension.getBlock(possibleBlockLocation);
        const possibleEvent = { block: possibleBlock, player: event.player, bypassInteractionLimit: true };
        this.onPlayerPlaceBreakOrInteractWithBlock(possibleEvent);
    }

    onPlayerPlaceBreakOrInteractWithBlock(event) {
        if (event.player.id !== this.builder.getPlayer().id)
            return;
        if (this.interactedThisTick && !event.bypassInteractionLimit)
            return;
        this.interactedThisTick = true;
        system.run(() => this.interactedThisTick = false);
        const block = event.block;
        this.tryApplySymmetry(block);
    }

    tryApplySymmetry(block) {
        if (!this.isInEffectiveRange(block.location))
            return;
        this.applySymmetry(block);
    }

    isInEffectiveRange(location) {
        return this.location.distance(location) < this.effectiveRange;
    }

    async applySymmetry(block) {
        if (this.isMirroringX() && this.isMirroringZ() && this.isRotating()) {
            new EightDirectionalMirrorTransform(this.location, block).transform();
        } else {
            if (this.isRotating())
                new RotationTransform(this.location, block).transform();
            if (this.isMirroringX() && this.isMirroringZ())
                new MirrorXZTransform(this.location, block).transform();
            else if (this.isMirroringX())
                new MirrorXTransform(this.location, block).transform();
            else if (this.isMirroringZ())
                new MirrorZTransform(this.location, block).transform();
        }
    }

    isMirroringX() {
        return this.mirrorAxis === StructureMirrorAxis.X || this.mirrorAxis === StructureMirrorAxis.XZ;
    }

    isMirroringZ() {
        return this.mirrorAxis === StructureMirrorAxis.Z || this.mirrorAxis === StructureMirrorAxis.XZ;
    }

    isRotating() {
        return this.rotation === true;
    }
}