import { Experiment } from "./experiment";
import { Message } from "./message";
import { Robot } from "./robot";

export interface Grid {
  id?: number;
  gridId?: string;
  robot?: Robot;
  experiment?: Experiment;
  messages?: Message[];
}
