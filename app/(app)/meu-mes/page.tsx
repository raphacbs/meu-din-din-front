import { Suspense } from "react";
import { Spin } from "antd";

import { MeuMesView } from "@/components/transactions/meu-mes-view";

export default function MeuMesPage() {
  return (
    <Suspense
      fallback={
        <Spin tip="Carregando Meu mês...">
          <div style={{ minHeight: 120 }} />
        </Spin>
      }
    >
      <MeuMesView />
    </Suspense>
  );
}
