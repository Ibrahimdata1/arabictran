'use client';

import { DisplayMode } from '@/lib/types';

interface LanguageToggleProps {
  mode: DisplayMode;
  onChange: (mode: DisplayMode) => void;
}

export default function LanguageToggle({ mode, onChange }: LanguageToggleProps) {
  const modes: { value: DisplayMode; label: string; sublabel: string }[] = [
    { value: 'arabic', label: 'عربي', sublabel: 'อาหรับ' },
    { value: 'bilingual', label: 'عربي-ไทย', sublabel: 'คู่ภาษา' },
    { value: 'thai', label: 'ไทย', sublabel: 'แปลไทย' },
  ];

  return (
    <div className="inline-flex items-center rounded-xl border border-[var(--color-gold)]/20 bg-[var(--color-paper)] p-0.5 sm:p-1 shadow-sm">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          className={`relative flex flex-col items-center gap-0 sm:gap-0.5 rounded-lg px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
            mode === m.value
              ? 'toggle-active'
              : 'text-[var(--color-ink-light)] hover:text-[var(--color-teal)] hover:bg-[var(--color-cream)]'
          }`}
        >
          <span
            className="text-xs sm:text-sm"
            style={m.value !== 'thai' ? { fontFamily: "var(--font-amiri), 'Amiri', serif" } : {}}
          >
            {m.label}
          </span>
          <span className="hidden sm:block text-[10px] opacity-70">{m.sublabel}</span>
        </button>
      ))}
    </div>
  );
}
