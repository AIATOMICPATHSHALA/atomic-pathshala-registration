export type StudentClass = "Class 11" | "Class 12" | "Dropper";

export interface RegistrationFormValues {
  name: string;
  phone: string;
  studentClass: StudentClass | "";
  otp: string;
}

export interface RegistrationPayload {
  name: string;
  phone: string;
  class: StudentClass;
  otp: string;
  timestamp: string;
}

/** The live session's date/time/Meet link — auto-generated via Google Calendar. */
export interface SessionInfo {
  date: string;
  time: string;
  meetLink: string;
}

export interface ApiResponse {
  status: "success" | "error";
  message?: string;
  session?: SessionInfo;
}
