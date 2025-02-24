export interface ChartSurface {
  x: number[];
  y: number[];
  z: number[][];
  type: string;
  opacity: number;
  showscale: boolean;
  colorscale?: string;
}
