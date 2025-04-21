// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Grid } from './grid';

export interface Message {
  id: number;
  x_pos: number;
  y_pos: number;
  intensity: number;
  splined_intensity: number;
  is_last: boolean;
  grid: Grid;
}
