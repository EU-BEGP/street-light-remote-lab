export interface User {
  id?: number;
  email: string;
  password?: string;
  name?: string;
  groups?: { name: string }[];
  last_name?: string;
  token?: string;
}
