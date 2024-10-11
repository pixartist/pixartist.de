import { World } from "noa-engine/dist/src/lib/world";
import { Worldgen } from "./worldgen/worldgen";

export class GameState {
  constructor(
    readonly worldgen: Worldgen,
    readonly world: World) { }
}