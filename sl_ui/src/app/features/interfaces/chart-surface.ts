// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

export interface ChartSurface {
  x: number[];
  y: number[];
  z: number[][];
  type: string;
  opacity: number;
  showscale: boolean;
  colorscale?: string;
}
