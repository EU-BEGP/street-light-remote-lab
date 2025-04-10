// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Light } from './light';
import { Message } from './message';

export interface Grid {
  id?: number;
  code?: string;
  width?: number;
  height?: number;
  complete?: boolean;
  light?: Light;
  grid_messages?: Message[];
}
