import { Patient } from "../types";

export const MOCK_QUEUE: Patient[] = [
  {
    id: "1",
    name: "Alice M.",
    token: 42,
    type: "Check-up",
    status: "In Progress",
    arrivalTime: "10:30 AM",
  },
  {
    id: "2",
    name: "Robert Fox",
    token: 43,
    type: "Report",
    status: "Waiting",
    arrivalTime: "10:45 AM",
  },
  {
    id: "3",
    name: "Cody Fisher",
    token: 44,
    type: "Emergency",
    status: "Waiting",
    arrivalTime: "11:00 AM",
  },
  {
    id: "4",
    name: "Esther Howard",
    token: 45,
    type: "Check-up",
    status: "Delayed",
    arrivalTime: "11:15 AM",
  },
  {
    id: "5",
    name: "Jenny Wilson",
    token: 46,
    type: "Follow-up",
    status: "Waiting",
    arrivalTime: "11:30 AM",
  },
];
