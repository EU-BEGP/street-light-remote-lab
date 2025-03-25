// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

export interface Light {
  id?: number;
  code: string;
  type: string;
  pwm?: number;
  timeInterval?: number;
  dcVoltage?: number;
  dcCurrent?: number;
  dcPower?: number;
  dcEnergyConsumption?: number;
  dcEnergyCharge?: number;
  dcLevel?: number;
  acVoltage?: number;
  acCurrent?: number;
  acPower?: number;
  acEnergy?: number;
  acFrequency?: number;
  acFactor?: number;
}
