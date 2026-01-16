export interface User {
  PK: string; // <userId>
  SK: string; // PROFILE
  userId: string;

  role: "DOCTOR" | "PATIENT";

  name: string;
  email: string;
  phone: string;

  hospitalName?: string; //for Only doctors

  createdAt: string;
}
