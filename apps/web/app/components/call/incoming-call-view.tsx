import { ArrowIcon } from "../icons";
import { CallScreen, CallTitle } from "./call-screen";

export function IncomingCallView({ onAnswer }: { onAnswer: () => void }) {
  return (
    <CallScreen>
      <p className="pixel chip chip-live inline-flex items-center gap-2.5 text-sm">
        Incoming call
      </p>
      <CallTitle>Relay is calling</CallTitle>
      <p className="text-pretty text-muted-foreground">
        A Relay assistant is calling about your delivery. Answer when you are
        ready.
      </p>
      <button
        type="button"
        onClick={onAnswer}
        className="button button-primary mt-2.5 h-[46px] min-w-[180px]"
      >
        <span>Answer</span>
        <ArrowIcon />
      </button>
    </CallScreen>
  );
}
