import { TransactionFormView } from "@/components/transactions/transaction-form-view";

interface TransactionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  const { id } = await params;

  return <TransactionFormView transactionId={id} />;
}
