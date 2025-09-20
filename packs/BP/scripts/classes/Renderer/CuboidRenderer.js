import { MolangVariableMap, system, TicksPerSecond, world } from "@minecraft/server";
import { Vector } from "../../lib/Vector";

export class CuboidRenderer {
    dimension;
    min = new Vector();
    max = new Vector();
    drawParticle = "simpleaxiom:outline";
    drawFrequencyTicks;
    particleLifetimeTicks;
    color = { red: 1, green: 1, blue: 1, alpha: 1 };
    
    particlesToDraw = [];
    #runner = void 0;

    constructor(dimension, min, max, drawFrequency = 10, particleLifetime = 20) {
        this.dimension = dimension;
        this.min = Vector.from(min);
        this.max = Vector.from(max);
        this.drawFrequencyTicks = drawFrequency;
        this.particleLifetimeTicks = particleLifetime;
        this.vertices = this.getVertices(min, max);
    }

    startDraw() {
        this.#runner = system.runInterval(() => this.draw(), this.drawFrequencyTicks);
    }

    stopDraw() {
        if (!this.#runner)
            return;
        system.clearRun(this.#runner);
        this.#runner = void 0;
    }

    draw() {
        this.particlesToDraw.length = 0;
        this.particlesToDraw.push(...this.getVerticeParticles());
        this.particlesToDraw.push(...this.getCubiodEdgeParticles());
        this.drawParticles();
    }

    drawParticles() {
        for (let [particleType, location] of this.particlesToDraw) {
            if (this.shouldIgnoreParticle(location))
                continue;
            const molang = new MolangVariableMap();
            molang.setColorRGBA("dot_color", this.getColorForParticle(location));
            const lifetimeSeconds = this.particleLifetimeTicks / TicksPerSecond;
            molang.setFloat("lifetime", lifetimeSeconds);
            try {
                this.dimension.spawnParticle(particleType, location, molang);
            } catch (e) {
                /* pass */
            }
        }
    }

    getColorForParticle(location) {
        throw new Error('getColorForParticle() must be implemented.');
    }

    shouldIgnoreParticle(location) {
        return false;
    }

    getStandaloneParticles() {
        throw new Error('getStandaloneParticles() must be implemented.');
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

    setColor(rgb = { red: 1, green: 1, blue: 1}) {
        this.color = { ...rgb, alpha: 1 };
    }

    getVerticeParticles() {
        return this.vertices.map((v) => [this.drawParticle, v]);
    }

    getCubiodEdgeParticles() {
        const edges = [
            [0, 1],
            [0, 2],
            [0, 4],
            [1, 3],
            [1, 5],
            [2, 3],
            [2, 6],
            [3, 7],
            [4, 5],
            [4, 6],
            [5, 7],
            [6, 7]
        ];
        const edgePoints = [];
        for (const edge of edges) {
            const [startVertex, endVertex] = [this.vertices[edge[0]], this.vertices[edge[1]]];
            const resolution = Math.min(Math.floor(endVertex.subtract(startVertex).length), 16);
            for (let i = 1; i < resolution; i++) {
                const t = i / resolution;
                edgePoints.push(startVertex.lerp(endVertex, t));
            }
        }
        return edgePoints.map((v) => [this.drawParticle, v]);
    }
}