import { Engine } from "noa-engine";
import { Blocktype } from "./blocktype";
import { Materialtype } from "./materialtype";
export class GamedataLoader {
  private blocks: Blocktype[] = [];
  private materials: Materialtype[] = [];
  constructor(readonly engine: Engine) {

    this.registerWithEngine();
  }

  private loadGamedata() {
    const mat_grass: Materialtype = { name: 'block_grass', color: [0, 1, 0] };
    const block_grass: Blocktype = {
      id: 0,
      material: 'block_grass'
    };
    this.materials.push(mat_grass);
    this.blocks.push(block_grass);
  }

  private registerWithEngine() {
    for (let material of this.materials) {
      this.engine.registry.registerMaterial(material.name, material);
    }

    for (let block of this.blocks) {
      this.engine.registry.registerBlock(block.id, block);
    }
  }
}