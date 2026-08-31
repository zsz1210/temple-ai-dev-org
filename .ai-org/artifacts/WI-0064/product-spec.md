# Product specification — WI-0064

## Problem

WI-0062 observed detailed Token usage but could not prove the effective model because Temple read the wrong response location. WI-0063 corrected and independently verified the local protocol mapping. A single bounded live turn is required before any larger experiment can trust model attribution.

## Required evidence

The result is `pass` only when one Provider-owned task has all of the following:

- the expected project, Work Item, Position, Agent Identity, Provider, launch revision, task ID, thread ID, and turn ID;
- requested model `gpt-5.6-luna` kept distinct from a non-empty Provider-observed effective model in the GPT-5.6 family;
- acknowledged reasoning effort `max` when the installed Provider returns the field;
- a terminal completed outcome and numeric detailed `total_tokens > 0` with observation time and provenance;
- no unapproved reroute, retry, fallback, network access, raw Provider payload retention, or product-file mutation.

Anything less is `partial` or `fail` and keeps the four-repository rehearsal blocked.

## Non-claims

One turn cannot prove Token savings, monetary savings, model quality, optimal routing, microservice effectiveness, enterprise readiness, or account billing. Those claims remain false or unknown.
