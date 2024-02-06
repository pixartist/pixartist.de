import { Worldgen } from "../worldgen";

export class DefaultWorldgen implements Worldgen {
  generate(): void {
    throw new Error("Method not implemented.");
  }
}