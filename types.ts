export enum LensType {
  CONVEX = 'CONVEX', // 凸透镜
  CONCAVE = 'CONCAVE' // 凹透镜
}

export interface SimulationState {
  lensType: LensType;
  focalLength: number; // Absolute value in simulation units
  objectDistance: number; // Distance from center (always positive in UI, handled as negative in math)
  objectHeight: number; // Height of the object
}

export interface Point {
  x: number;
  y: number;
}
