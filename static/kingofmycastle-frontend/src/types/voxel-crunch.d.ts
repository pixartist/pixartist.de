declare module 'voxel-crunch' {
  function encode(chunk: ArrayLike<number>, result?: Uint8Array): Uint8Array;
  function decode(runs: Uint8Array, result: ArrayLike<number>): ArrayLike<number>;
  function size(chunk: ArrayLike<number>): number;
}