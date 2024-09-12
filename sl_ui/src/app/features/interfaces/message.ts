import { Grid } from "./grid";

export interface Message {
  id: number;
  x_pos: number;
  y_pos: number;
  intensity: number;
  is_last: boolean;
  grid: Grid;
}
