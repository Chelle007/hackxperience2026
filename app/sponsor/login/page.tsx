import { redirect } from "next/navigation";

export default function SponsorLoginPage() {
  redirect("/login?role=sponsor");
}
