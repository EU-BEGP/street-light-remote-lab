// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

export interface User {
  id?: number;
  email: string;
  password?: string;
  name?: string;
  groups?: { name: string }[];
  last_name?: string;
  token?: string;
}
