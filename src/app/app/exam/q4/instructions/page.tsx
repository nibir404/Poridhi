import { Suspense } from "react";
import ExamWorkspace from "@/components/workspace/ExamWorkspace";

export const metadata = { title: "Exam question · Poridhi" };

export default function Page() {
  return <Suspense fallback={null}><ExamWorkspace /></Suspense>;
}
