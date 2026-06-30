"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-xs text-slate-light underline-offset-2 hover:text-stamp hover:underline"
    >
      Sign out
    </button>
  );
}
