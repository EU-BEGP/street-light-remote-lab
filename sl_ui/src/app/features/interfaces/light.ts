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
  frequency?: number;
  factor?: number;
}
