export interface TimesheetEntry {
  id: string;
  date: string; // YYYY-MM-DD
  task: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}