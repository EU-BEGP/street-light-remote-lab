import { Robot } from './robot';

export interface Lamp {
  id?: number;
  code?: number;
  dimLevel?: number;
  state?: number;
  robot?: Robot;
}
