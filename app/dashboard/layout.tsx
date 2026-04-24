import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-5 ">
      {/* You can add a shared dashboard navigation or sidebar here later */}
      
      <main className="flex-1 rounded-2xl border ">{children}</main>
    </div>
  );
}