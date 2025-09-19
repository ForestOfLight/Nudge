import { MolangVariableMap, system, TicksPerSecond, world } from "@minecraft/server";
import { Vector } from "../../lib/Vector";

export class VolumeRenderer {
    dimension;
    min = new Vector();
    max = new Vector();
    drawParticleBase = "simpleaxiom:blockoverlay_";
    drawFrequency;
    particleLifetime;
    
    #drawParticles = [];
    #runner = void 0;

    constructor(dimension, min, max, drawFrequency = 10, particleLifetime = 20) {
        this.dimension = dimension;
        this.min = Vector.from(min);
        this.max = Vector.from(max);
        this.drawFrequency = drawFrequency;
        this.particleLifetime = particleLifetime;
        this.vertices = this.getVertices(min, max);
    }

    startDraw() {
        this.#runner = system.runInterval(() => this.draw(), this.drawFrequency);
    }

    stopDraw() {
        if (!this.#runner)
            return;
        system.clearRun(this.#runner);
        this.#runner = void 0;
    }

    draw() {
        this.drawParticles(this.getCuboidFaceParticles());
    }

    drawParticles(particles) {
        this.#drawParticles.length = 0;
        this.#drawParticles.push(...particles);
        for (const { particle, location, size } of this.#drawParticles) {
            const molang = new MolangVariableMap();
            molang.setColorRGBA("face_color", { red: 1, green: 1, blue: 1, alpha: 0.05 });
            const lifetimeSeconds = this.particleLifetime / TicksPerSecond;
            molang.setFloat("lifetime", lifetimeSeconds);
            molang.setFloat("width", size.width);
            molang.setFloat("height", size.height);
            try {
                this.dimension.spawnParticle(particle, location, molang);
            } catch (e) {
                /* pass */
            }
        }
    }

    getVertices(min, max) {
        return [
            new Vector(min.x, min.y, min.z),
            new Vector(max.x, min.y, min.z),
            new Vector(min.x, max.y, min.z),
            new Vector(max.x, max.y, min.z),
            new Vector(min.x, min.y, max.z),
            new Vector(max.x, min.y, max.z),
            new Vector(min.x, max.y, max.z),
            new Vector(max.x, max.y, max.z)
        ];
    }

    setVertices(dimension, min, max) {
        this.dimension = dimension;
        this.min = Vector.from(min);
        this.max = Vector.from(max);
        this.vertices = this.getVertices(min, max);
    }

    getCuboidFaceParticles() {
        const faces = [
            { name: "bottom", vertex: [0, 5], axis: "xz" },
            { name: "top", vertex: [2, 7], axis: "xz" },
            { name: "north", vertex: [0, 3], axis: "xy" },
            { name: "south", vertex: [4, 7], axis: "xy" },
            { name: "east", vertex: [1, 7], axis: "yz" },
            { name: "west", vertex: [0, 6], axis: "yz" }
        ];
        return faces.map(face => {
            const minVertex = this.vertices[face.vertex[0]];
            const maxVertex = this.vertices[face.vertex[1]];
            const sizeVec = maxVertex.subtract(minVertex).multiply(0.5);
            let size;
            if (face.axis === "xz")
                size = { width: sizeVec.x, height: sizeVec.z };
            else if (face.axis === "xy")
                size = { width: sizeVec.x, height: sizeVec.y };
            else
                size = { width: sizeVec.z, height: sizeVec.y };
            const centerpoint = minVertex.add(sizeVec);
            return {
                particle: this.drawParticleBase + face.axis,
                location: centerpoint,
                size
            };
        });
    }
}