import { redirect } from "next/navigation";

export async function generateStaticParams() {
  return [];
}

export default function TransactionDetailPage() {
  redirect("/meu-mes");
}
