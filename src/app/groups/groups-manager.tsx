"use client";

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";

interface Group {
  id: string;
  name: string;
  joinCode: string;
}

const box: CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: "0.75rem",
  padding: "1rem 1.25rem",
  width: "100%",
  maxWidth: "32rem",
};

const input: CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid #d1d5db",
  flex: 1,
};

const btn: CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "0.5rem",
  border: "none",
  background: "#111827",
  color: "white",
  cursor: "pointer",
};

export function GroupsManager() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/groups");
    const data = (await res.json()) as { groups?: Group[]; error?: string };
    if (!res.ok) setError(data.error ?? "Failed to load groups");
    else setGroups(data.groups ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function create(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) setError(data.error ?? "Failed to create group");
    else {
      setName("");
      await refresh();
    }
  }

  async function join(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) setError(data.error ?? "Failed to join group");
    else {
      setCode("");
      await refresh();
    }
  }

  return (
    <div style={{ display: "grid", gap: "1.5rem", justifyItems: "center" }}>
      <div style={box}>
        <h2 style={{ fontSize: "1rem", marginTop: 0 }}>Your groups</h2>
        {loading ? (
          <p style={{ color: "#6b7280" }}>Loading…</p>
        ) : groups.length === 0 ? (
          <p style={{ color: "#6b7280" }}>
            You&apos;re not in any group yet. Create one and share its code, or
            join with a code someone gave you.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
            {groups.map((g) => (
              <li
                key={g.id}
                style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}
              >
                <span>{g.name}</span>
                <code
                  style={{
                    background: "#f3f4f6",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "0.375rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  {g.joinCode}
                </code>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={create} style={{ ...box, display: "flex", gap: "0.5rem" }}>
        <input
          style={input}
          placeholder="New group name (e.g. Family)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button style={btn} type="submit">
          Create
        </button>
      </form>

      <form onSubmit={join} style={{ ...box, display: "flex", gap: "0.5rem" }}>
        <input
          style={{ ...input, textTransform: "uppercase" }}
          placeholder="Join with code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button style={btn} type="submit">
          Join
        </button>
      </form>

      {error && <p style={{ color: "#b91c1c" }}>⚠ {error}</p>}
    </div>
  );
}
