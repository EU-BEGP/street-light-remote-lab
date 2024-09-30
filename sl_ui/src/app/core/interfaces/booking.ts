export interface Booking {
  id: number;
  start_date: string;
  end_date: string;
  available: boolean;
  public: boolean;
  access_key: string;
  password: string;
  reserved_by: {
    name: string;
    last_name: string;
    email: string;
  };
  equipment: {
    id: number;
    name: string;
  };
}
