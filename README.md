# Relay

Relay is a service that makes AI voice calls for delivery merchants.

A merchant gives Relay the details of a delivery — who the customer is, what is
being delivered, when it should arrive, and what the customer is allowed to do
(like reschedule or cancel). Relay calls the customer and an AI assistant talks
to them on the phone: it explains the delivery, offers new delivery times, and
records what the customer chooses. The merchant can then see every call and its
transcript in a web console.

Relay is a monorepo (a single repository holding several projects) built with
TypeScript. It uses LiveKit for the audio call, Postgres to store data, and
Redis as a message stream between its parts.

---

## What happens in a call

1. A merchant signs in to the web console and fills in a call form: the
   customer, the delivery, and the rules (for example, "may reschedule" and the
   days and hours that are allowed).
2. The form is sent to the API. The API checks it and asks the engine to place
   the call.
3. The engine saves the call, works out up to three new delivery times from the
   allowed days and hours, and opens a LiveKit room (the phone room).
4. The customer opens the call page in their browser and answers. The API gives
   the browser a LiveKit token so it can join the room.
5. The AI agent joins the room and talks to the customer. It explains the
   delivery and offers the three times.
6. When the customer picks a time, asks to cancel, or asks for a person, the
   agent sends that as a proposal to the engine.
7. The engine checks the proposal against the rules. If it is allowed, it saves
   the result on the call. If not, it records why it was refused.
8. The console shows the call, its status, its outcome, and the full transcript.

---

## The architecture

Relay is split into four apps and a set of shared packages.

### Apps

| App           | What it does                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/web`    | The web console. Sign up, log in, place calls, view calls and transcripts, and answer a call in the browser.                         |
| `apps/api`    | The HTTP server. Handles login and requests from the console, checks incoming data, and gives the browser its LiveKit token.         |
| `apps/engine` | The core of the system. It creates calls, generates the offered times, checks every proposal, and saves all results to the database. |
| `apps/agent`  | The voice assistant. It joins the call room and talks to the customer using speech-to-text, a language model, and text-to-speech.    |

### Shared packages

| Package        | What it does                                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@repo/core`   | The rules. It validates a call request, generates the offered times, and decides whether a proposal is allowed. Pure logic, with no database or network. |
| `@repo/types`  | The shared data shapes used across all apps.                                                                                                             |
| `@repo/db`     | The database client (Postgres, through Prisma).                                                                                                          |
| `@repo/redis`  | The shared Redis connection and the message stream.                                                                                                      |
| `@repo/config` | The single place that reads environment variables.                                                                                                       |

### How the parts communicate

The apps never call each other over HTTP. The API and the agent both write
messages to **one Redis stream** (`relay:commands`), and the engine reads that
stream and does the work.

- The API writes "make this call."
- The agent writes "the customer proposed this."
- The engine reads both and is the only app that writes to the database.

### Infrastructure

| Piece                 | What it is for                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| **Postgres**          | The database and the source of truth. Stores merchants, calls, transcripts, and tool calls.              |
| **Redis**             | The message stream that the apps use to pass notes to each other.                                        |
| **LiveKit**           | The phone system. Creates call rooms and carries the audio between the customer's browser and the agent. |
| **LiveKit Inference** | Provides the agent's speech-to-text, language model, and text-to-speech.                                 |

### Where data lives

- **Postgres** holds everything that must last: merchants, calls, transcripts,
  and tool calls.
- **Redis** holds the message stream that moves work between the apps.
- **The agent's memory** holds only what the agent needs during a single call.

Only the engine writes to Postgres. The API reads it to show the console, and
the agent reads it to know what to say.
