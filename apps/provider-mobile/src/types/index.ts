export interface Patient {
  id: string;
  name: string;
  token: number;
  type: "Check-up" | "Emergency" | "Report" | "Follow-up";
  status: "Waiting" | "In Progress" | "Completed" | "Delayed";
  arrivalTime: string;
}

export interface QueueStats {
  waiting: number;
  completed: number;
  avgTime: string;
}
