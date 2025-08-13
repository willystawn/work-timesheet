export interface TimesheetEntry {
  id: string;
  date: string; // YYYY-MM-DD
  task: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export type Database = {
  public: {
    Tables: {
      timesheet_entries: {
        Row: {
          id: string;
          date: string;
          task: string;
          startTime: string;
          endTime: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          date: string;
          task: string;
          startTime: string;
          endTime: string;
          user_id: string;
        };
        Update: {
          id?: string;
          date?: string;
          task?: string;
          startTime?: string;
          endTime?: string;
          user_id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
