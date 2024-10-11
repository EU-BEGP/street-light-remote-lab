export interface Light {
  id?: number;
  code?: string;
  type?: string;
  pwm?: number;
  battery_current?: number;
  battery_voltage?: number;
  battery_power?: number;
  battery_level?: number;
  battery_energy?: number;
}
