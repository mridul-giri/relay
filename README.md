# Relay

> An event-driven voice AI agent that phones the right person when a delivery
> trip needs coordinating. **Code decides, the LLM talks.**

Relay watches a delivery trip and places a voice call to the driver or the
customer when something changes — an arrival time slips, the driver goes quiet,
a customer wants to reschedule.

Deterministic code decides who gets called, when, and whether to escalate. The
LLM's only jobs are producing the spoken sentences and proposing tool calls, and
a validator accepts or rejects every proposal before it can affect the trip. The
driver and customer each get their own voice session and never talk to each
other; they coordinate only through one shared, versioned trip record, and every
decision is written to an audit log. The voice runtime sits behind a single
interface so it can be swapped out later.

Relay is built for engineering depth — real-time systems, concurrency,
idempotency, and reliability. The logistics story is deliberately thin so the
effort goes into the machinery, not the domain.

## Out of scope

Real transport-system integration, GPS and maps, proof of delivery, fees,
consent and calling-hour rules, dispatcher dashboards, accounts and billing,
real phone numbers, and SMS/email fallbacks. Relay is a portfolio-grade
engineering project with synthetic data; it integrates with no external system
and writes back to nothing.
