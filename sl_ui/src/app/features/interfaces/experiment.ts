import { User } from 'src/app/core/interfaces/user';

export interface Experiment {
  id?: number;
  name?: string;
  owner?: User;
}
