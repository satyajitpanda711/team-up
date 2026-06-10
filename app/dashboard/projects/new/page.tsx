import CreateProjectForm from "./components/CreateProjectForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Project",
};

export default function NewProjectPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      <CreateProjectForm />
    </main>
  );
}
