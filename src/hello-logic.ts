// Pure logic for the hello task.
// Kept separate so it can be unit-tested without a Trigger.dev runtime.

export type HelloPayload = {
  who?: string;
};

export type HelloOutput = {
  greeting: string;
  at: string; // ISO timestamp
};

export function makeGreeting(payload: HelloPayload): HelloOutput {
  const who = (payload?.who ?? "world").trim() || "world";
  return {
    greeting: `hello, ${who}!`,
    at: new Date().toISOString(),
  };
}