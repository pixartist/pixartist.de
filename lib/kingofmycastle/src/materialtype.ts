export interface Materialtype {
  name: string;
  /** An array of 0..1 floats, either [R,G,B] or [R,G,B,A]
   * @type {number[]}
   */
  color: number[];
  /** Filename of texture image, if any
   * @type {string}
   */
  textureURL?: string;
  /** Whether the texture image has alpha */
  texHasAlpha?: boolean;
  /** Index into a (vertical strip) texture atlas, if applicable */
  atlasIndex?: number;
  /**
   * An optional Babylon.js `Material`. If specified, terrain for this voxel
   * will be rendered with the supplied material (this can impact performance).
   */
  renderMaterial?: any;
}