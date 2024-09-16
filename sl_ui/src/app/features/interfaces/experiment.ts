import { User } from 'src/app/core/auth/interfaces/user';

export interface Experiment {
  id?: number;
  name?: string;
  owner?: User;
}
