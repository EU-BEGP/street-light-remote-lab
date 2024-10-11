import { User } from 'src/app/core/interfaces/user';
import { Light } from './light';

export interface Experiment {
  id?: number;
  name?: string;
  owner?: User;
  light?: Light;
}
