export type StudentClass = "Class 11" | "Class 12" | "Dropper";

export interface RegistrationFormValues {
  name: string;
  phone: string;
  studentClass: StudentClass | "";
}

export interface RegistrationPayload {
  name: string;
  phone: string;
  class: StudentClass;
  timestamp: string;
}

/** The live session's date/time/Meet link — auto-generated via Google Calendar. */
export interface SessionInfo {
  date: string;
  time: string;
  meetLink: string;
}

export interface ApiResponse {
  success?: boolean;
  status?: "success" | "error";
  message?: string;
  session?: SessionInfo;
}

export interface RegisterApiResponse {
  success: boolean;
  message?: string;
  session?: SessionInfo;
}
