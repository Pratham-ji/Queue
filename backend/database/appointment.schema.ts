export interface Appointment {
  PK: string; // QUEUE#<queueId>
  SK: string; // TOKEN#<tokenNumber>

  appointmentId: string;
  queueId: string;
  patientId: string;

  tokenNumber: number;
  slotTime: string; // HH:mm

  status: "BOOKED" | "CANCELLED" | "COMPLETED";

  createdAt: string;
}
