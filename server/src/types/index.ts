export interface location {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  maxParkingMin: number;
}

export interface ticket {
  id: number;
  location: {
    id: number | null;
    address: string;
    city: string;
    postalCode: string;
  };
  time: string;
  licensePlate: string;
  tatbestand: number;
}

export interface tatbestand {
  id: number;
  description: string;
  stornoErlaubt: boolean;
}

export interface DataBase {
  locations: location[];
  tickets: ticket[];
  tatbestände: tatbestand[];
}
