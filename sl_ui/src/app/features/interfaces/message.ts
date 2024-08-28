import { Grid } from "./grid";

export interface Message {
  id?: number;
  xPos?: number;
  yPos?: number;
  intensity?: number;
  isLast?: boolean;
  grid?: Grid;
}
