# Relay

Relay is a service that makes AI voice calls for delivery merchants.

A merchant gives Relay the details of a delivery — who the customer is, what is
being delivered, when it should arrive, and what the customer is allowed to do
(like reschedule or cancel). Relay calls the customer and an AI assistant talks
to them: it explains the delivery, offers new delivery times, and records what
the customer chooses. The merchant can then see every call and its transcript
in a web console.

Relay is a monorepo (a single repository holding several projects) built with
TypeScript. It uses LiveKit for the audio call and Postgres to store data.

---

## What happens in a call

1. A merchant signs in to the web console and fills in a call form: the
   customer, the delivery, and the rules (for example, "may reschedule" and the
   new delivery times they are willing to offer).
2. The form is sent to the API. The API checks it, gives each offered time an
   id and a spoken label, and saves the call in Postgres as **queued**.
3. The console shows a notification with the call link. Opening it takes the
   customer to the call page.
4. The customer presses **Answer**. The API gives the browser a LiveKit token
   so it can join the call room.
5. As soon as the customer joins, LiveKit creates the room and sends the AI
   agent into it. The agent finds the call by the room's name and starts
   talking: it explains the delivery and offers the merchant's times.
6. When the customer picks a time, asks to cancel, or asks for a person, the
   agent checks the choice against the rules. If it is allowed, the agent saves
   the result on the call. If not, it tells the customer why and carries on.
7. When the customer hangs up, the call ends. If no one answers within two
   minutes, the API marks the call as **no answer**.
8. The console shows the call, its status, its outcome, and the full transcript.

---

## The architecture

Relay is split into three apps and a small set of shared packages.

### Apps

| App          | What it does                                                                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web`   | The web console. Sign up, log in, place calls, view calls and transcripts, and answer a call in the browser.                                             |
| `apps/api`   | The HTTP server. Handles login, checks and saves new calls, lists calls for the console, gives the browser its LiveKit token, and ends unanswered calls. |
| `apps/agent` | The voice assistant. It joins the call room, talks to the customer, checks every choice against the call's rules, and saves the transcript and outcome.  |

### Shared packages

| Package    | What it does                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------- |
| `@repo/db` | The database client (Postgres, through Prisma). Its generated types are the shared data shapes. |
| `@repo/ui` | Shared React components and the Tailwind + shadcn/ui theme used by the console.                 |     |

### How the parts communicate

The apps never call each other. They meet in two places:

- **Postgres.** The API saves a new call there. The agent reads that call to
  know what to say, and writes the transcript and outcome back.
- **LiveKit.** The API gives the customer a token for the call's room. When the
  customer joins, LiveKit sends the agent into the same room.

The room name (`relay-call-<id>`) is what ties them together: the API stores it
on the call, and the agent uses it to find the call.

### Infrastructure

| Piece                 | What it is for                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Postgres**          | The database and the source of truth. Stores merchants, calls, and transcripts.                                 |
| **LiveKit**           | The phone system. Creates call rooms, sends the agent in, and carries the audio between the customer and agent. |
| **LiveKit Inference** | Provides the agent's speech-to-text, language model, and text-to-speech.                                        |

### Where data lives

- **Postgres** holds everything that must last: merchants, calls (with the
  offered times, the chosen time, and the outcome), and transcripts.
- **The browser** holds the merchant's sign-in token.
- **The agent's memory** holds only what the agent needs during a single call.

The API writes new calls and ends unanswered ones. The agent writes everything
that happens during the call. The AI never decides on its own — every choice it
makes is checked in code before it is saved.

---

## Running it locally

1. Install dependencies: `bun install`
2. Copy `.env.example` to `.env` and fill in `JWT_SECRET` and the `LIVEKIT_*`
   values.
3. Start Postgres: `docker compose -f docker/compose.yaml up -d`
4. Create the tables and the database client (in `packages/db`):
   `bunx prisma db push` and `bunx prisma generate`
5. Start everything: `bun run dev`

The console runs at `http://localhost:3000` and the API at
`http://localhost:3001`.
