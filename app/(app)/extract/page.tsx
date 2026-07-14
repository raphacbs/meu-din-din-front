import { Suspense } from "react";
import { Spin } from "antd";

import { ExtractView } from "@/components/transactions/extract-view";

export default function ExtractPage() {
  return (
    <Suspense
      fallback={
        <Spin tip="Carregando extrato...">
          <div style={{ minHeight: 120 }} />
        </Spin>
      }
    >
      <ExtractView />
    </Suspense>
  );
}
