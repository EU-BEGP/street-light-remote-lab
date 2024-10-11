import { Light } from './light';

export interface Robot {
  id?: number;
  code?: string;
  light?: Light;
}
