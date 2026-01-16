export interface Queue {
  PK: string; // DOCTOR#<doctorId>
  SK: string; // QUEUE#<queueId>

  queueId: string;
  doctorId: string;

  queueType: "AUTO" | "CUSTOM";

  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm

  slotDuration: number; // in minutes
  maxPatients: number;

  status: "ACTIVE" | "CLOSED";

  createdAt: string;
}
