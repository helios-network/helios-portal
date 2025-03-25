export interface Feedback {
  status: "idle" | "loading" | "success" | "error";
  message: string;
}
