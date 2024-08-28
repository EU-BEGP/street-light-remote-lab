import { User } from "src/app/core/auth/interfaces/user";
import { Robot } from "./robot";

export interface Experiment {
  id?: number;
  name?: string;
  owner?: User;
  robot?: Robot;
}
