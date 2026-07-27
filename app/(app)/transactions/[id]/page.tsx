import { redirect } from "next/navigation";

export async function generateStaticParams() {
  // Com output: "export", [] quebra o build — precisa de ao menos um param.
  return [{ id: "_" }];
}

export default function TransactionDetailPage() {
  redirect("/meu-mes");
}
