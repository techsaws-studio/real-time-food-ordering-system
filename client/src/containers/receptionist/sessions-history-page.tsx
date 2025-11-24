import React from "react";

import DashboardPageHeader from "@/components/partials/dashboard-page-header";

function SessionsHistoryPage() {
  return (
    <main className="bg-white w-full h-full">
      <section className="dashboard-layout-standard section-padding-standard flex flex-col gap-8">
        <DashboardPageHeader title="Sessions History" />
      </section>
    </main>
  );
}

export default SessionsHistoryPage;
