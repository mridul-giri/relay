import { CallFlow } from "../../components/call/call-flow";

export default async function CallPage({
  params,
}: {
  params: Promise<{ callId: string }>;
}) {
  const { callId } = await params;
  return <CallFlow callId={callId} />;
}
