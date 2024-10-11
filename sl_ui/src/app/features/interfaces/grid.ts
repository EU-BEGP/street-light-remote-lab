import { Experiment } from './experiment';
import { Light } from './light';
import { Message } from './message';

export interface Grid {
  id?: number;
  code?: string;
  width?: number;
  height?: number;
  complete?: boolean;
  experiment?: Experiment;
  light?: Light;
  grid_messages?: Message[];
}
