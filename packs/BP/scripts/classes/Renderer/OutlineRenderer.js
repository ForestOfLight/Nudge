import { MolangVariableMap, system, TicksPerSecond, world } from "@minecraft/server";
import { Vector } from "../../lib/Vector";

export class OutlineRenderer {
    dimension;
    min = new Vector();
    max = new Vector();
    drawParticle = "simpleaxiom:outline";
    drawFrequencyTicks;
    particleLifetimeTicks;
    color = { red: 1, green: 1, blue: 1, alpha: 1 };
    
    #drawParticles = [];
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
        this.drawParticles(this.getVerticeParticles());
        this.drawParticles(this.getCubiodEdgeParticles());
    }

    drawParticles(particleLocations) {
        this.#drawParticles.length = 0;
        this.#drawParticles.push(...particleLocations);
        for (const [particleType, location] of this.#drawParticles) {
            const molang = new MolangVariableMap();
            molang.setColorRGBA("dot_color", this.color);
            const lifetimeSeconds = this.particleLifetimeTicks / TicksPerSecond;
            molang.setFloat("lifetime", lifetimeSeconds);
            try {
                this.dimension.spawnParticle(particleType, location, molang);
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

    addStandaloneParticles(locations) {
        for (const location of locations)
            this.vertices.push(Vector.from(location));
    }
}