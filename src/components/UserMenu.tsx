'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="h-8 w-8 rounded-full bg-[var(--color-cream-dark)] animate-pulse" />
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[var(--color-teal)] hover:bg-[var(--color-teal)]/5 transition-colors border border-[var(--color-teal)]/20"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        เข้าสู่ระบบ
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-[var(--color-cream-dark)] transition-colors"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt=""
            className="h-7 w-7 rounded-full border border-[var(--color-gold)]/20"
          />
        ) : (
          <div className="h-7 w-7 rounded-full bg-[var(--color-teal)] text-white flex items-center justify-center text-xs font-bold">
            {session.user?.name?.[0] || '?'}
          </div>
        )}
        <span className="hidden sm:block text-xs text-[var(--color-ink-light)] max-w-[100px] truncate">
          {session.user?.name}
        </span>
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-xl bg-white shadow-lg border border-[var(--color-gold)]/15 py-2">
            <div className="px-4 py-2 border-b border-[var(--color-gold)]/10">
              <p className="text-sm font-medium text-[var(--color-ink)] truncate">{session.user?.name}</p>
              <p className="text-[10px] text-[var(--color-ink-light)] truncate">{session.user?.email}</p>
            </div>
            <button
              onClick={() => { signOut(); setMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              ออกจากระบบ
            </button>
          </div>
        </>
      )}
    </div>
  );
}
