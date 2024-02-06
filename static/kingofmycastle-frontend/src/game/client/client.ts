import { Engine } from "noa-engine";
import { GameState } from "kingofmycastle-lib/gamestate";
import { GamedataLoader } from "kingofmycastle-lib/gamedata-loader";
import { DefaultWorldgen } from "kingofmycastle-lib/worldgen/impl/default-worldgen";

export class Client {
  readonly engine: Engine;
  readonly gamedataLoader: GamedataLoader;
  readonly worldgen: DefaultWorldgen;
  readonly gamestate: GameState;
  constructor() {
    this.engine = new Engine({
      debug: true,
      showFPS: true,
      inverseY: true,
      inverseX: false,
      chunkSize: 32,
      chunkAddDistance: [3, 2],     // [horiz, vert]
      blockTestDistance: 50,
      playerStart: [0.5, 5, 0.5],
      playerHeight: 1.4,
      playerWidth: 0.6,
      playerAutoStep: true,
      playerShadowComponent: false,
      useAO: true,
      AOmultipliers: [0.92, 0.8, 0.5],
      reverseAOmultiplier: 1.0,
      manuallyControlChunkLoading: false,
      originRebaseDistance: 10,
      lightVector: [0.6, -1, -0.4],
    });
    this.gamedataLoader = new GamedataLoader(this.engine);
    this.worldgen = new DefaultWorldgen();
    this.gamestate = new GameState(this.worldgen, this.engine.world);
  }
  async syncWorld(gamestate: GameState): Promise<void> {
    throw new Error("Method not implemented.");
  }
}