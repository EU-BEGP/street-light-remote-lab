// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Light } from './light';

export interface Robot {
  id?: number;
  code?: string;
  light?: Light;
}
