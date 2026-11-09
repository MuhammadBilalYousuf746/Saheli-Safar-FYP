// Presentation-only, one-use receipt. Never stored with credentials/session data.
export function createLoginEntrance() {
  let serial = 0, pending = null;
  const peek = owner => pending && pending.owner === owner ? pending.id : null;
  return {
    observe(next, source) {
      if (source === "sign-in" && next.status === "authenticated" && next.session) pending = { id: ++serial, owner: next.session };
      else if (next.status !== "authenticated" || pending?.owner !== next.session) pending = null;
    },
    peek,
    consume(owner) {
      const id = peek(owner);
      if (id !== null) pending = null;
      return id;
    },
  };
}
