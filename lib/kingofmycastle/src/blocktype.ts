export interface Blocktype {
  id: number;
  solid?: boolean;
  /** Whether the block fully obscures neighboring blocks */
  opaque?: boolean;
  /** whether a nonsolid block is a fluid (buoyant, viscous..) */
  fluid?: boolean;
  /** The block material(s) for this voxel's faces. May be:
   *   * one (String) material name
   *   * array of 2 names: [top/bottom, sides]
   *   * array of 3 names: [top, bottom, sides]
   *   * array of 6 names: [-x, +x, -y, +y, -z, +z]
   * @type {string|string[]}
  */
  material: string | string[];
  /** Specifies a custom mesh for this voxel, instead of terrain  */
  blockMesh?: any;
  /** Fluid parameter for fluid blocks */
  fluidDensity?: number;
  /** Fluid parameter for fluid blocks */
  viscosity?: number;
}