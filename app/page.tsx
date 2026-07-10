import { redirect } from "next/navigation";

export default function RootPage() {
  // This ensures anyone visiting localhost:3000 goes straight to the dashboard, NOT the login page!
  redirect("/dashboard");
}