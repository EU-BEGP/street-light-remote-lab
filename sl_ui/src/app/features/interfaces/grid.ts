import { Experiment } from './experiment';
import { Lamp } from './lamp';

export interface Grid {
  id?: number;
  code?: string;
  width?: number;
  height?: number;
  complete?: boolean;
  lamp?: Lamp;
  experiment?: Experiment;
}
