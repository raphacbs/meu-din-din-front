import { redirect } from "next/navigation";

export default function NewTransactionPage() {
  redirect("/meu-mes?new=1");
}
