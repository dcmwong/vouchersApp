"use client";

import type { CSSProperties, ReactNode } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { FAMILY } from "../theme";
import { Avatar } from "./Avatar";

const row: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "100%",
  appearance: "none",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: "11px 8px",
  borderRadius: 10,
  fontFamily: "var(--va-body)",
  fontSize: 14.5,
  color: "var(--va-ink)",
  textAlign: "left",
  textDecoration: "none",
};

function ico(path: ReactNode) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0, color: "var(--va-soft)" }}
    >
      {path}
    </svg>
  );
}

export function AccountMenu({
  hiddenCount,
  onHidden,
  onClose,
}: {
  hiddenCount: number;
  onHidden: () => void;
  onClose: () => void;
}) {
  const { signOut } = useClerk();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "family@wallet.app";

  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 75 }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 74,
          right: 18,
          width: 248,
          background: "var(--va-surface)",
          borderRadius: 18,
          padding: 8,
          transformOrigin: "top right",
          boxShadow: "0 18px 50px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        {/* Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 8px 12px" }}>
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt={user.fullName ?? "Account"}
              style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
          ) : (
            <svg width="44" height="44" viewBox="0 0 42 42" style={{ borderRadius: "50%", flexShrink: 0 }}>
              <rect width="42" height="42" fill="#eceae4" />
              <circle cx="21" cy="16.5" r="7.4" fill="#a9aeb3" />
              <path d="M7.5 40c0.7-8.2 6.6-12.6 13.5-12.6S33.8 31.8 34.5 40z" fill="#a9aeb3" />
            </svg>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--va-head)", fontWeight: 800, fontSize: 15 }}>
              The Family
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--va-soft)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {email}
            </div>
          </div>
        </div>

        {/* Family members */}

        <div style={{ height: 1, background: "var(--va-line)", margin: "2px 6px 4px" }} />

        {/* Hidden cards */}
        <button
          onClick={onHidden}
          style={row}
          onMouseOver={(e) => (e.currentTarget.style.background = "var(--va-chip)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {ico(
            <>
              <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="2" />
            </>,
          )}
          <span style={{ flex: 1 }}>Hidden cards</span>
          {hiddenCount > 0 && (
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--va-soft)" }}>{hiddenCount}</span>
          )}
        </button>

        {/* Invite family → groups manager */}
        <a
          href="/groups"
          style={row}
          onMouseOver={(e) => (e.currentTarget.style.background = "var(--va-chip)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {ico(
            <>
              <path d="M16 18v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9.5" cy="7" r="3.2" stroke="currentColor" strokeWidth="2" />
              <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </>,
          )}
          <span style={{ flex: 1 }}>Invite family</span>
        </a>

        {/* Admin → admin page */}
        <a
          href="/admin"
          style={row}
          onMouseOver={(e) => (e.currentTarget.style.background = "var(--va-chip)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {ico(
            <>
              <path
                d="M10.3 3.3a2 2 0 013.4 0l.5.9a2 2 0 002 1l1 .1a2 2 0 011.7 3l-.5.9a2 2 0 000 2.2l.5.9a2 2 0 01-1.7 3l-1 .1a2 2 0 00-2 1l-.5.9a2 2 0 01-3.4 0l-.5-.9a2 2 0 00-2-1l-1-.1a2 2 0 01-1.7-3l.5-.9a2 2 0 000-2.2l-.5-.9a2 2 0 011.7-3l1-.1a2 2 0 002-1z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            </>,
          )}
          <span style={{ flex: 1 }}>Admin</span>
        </a>

        {/* Sign out */}
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          style={{ ...row, color: "var(--va-soft)" }}
          onMouseOver={(e) => (e.currentTarget.style.background = "var(--va-chip)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {ico(
            <>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </>,
          )}
          <span style={{ flex: 1 }}>Sign out</span>
        </button>
      </div>
    </div>
  );
}
