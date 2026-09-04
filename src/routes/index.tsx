import { createFileRoute } from "@tanstack/react-router";
import { AmazonSandbox } from "@/components/sandbox";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <AmazonSandbox />;
}
