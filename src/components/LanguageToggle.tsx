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
    { value: 'thai', label: 'ไทย', sublabel: 'ไทย' },
  ];

  return (
    <div className="inline-flex items-center rounded-xl border border-[var(--color-gold)]/20 bg-white p-1 shadow-sm">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          className={`relative flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            mode === m.value
              ? 'toggle-active'
              : 'text-[var(--color-ink-light)] hover:text-[var(--color-teal)] hover:bg-[var(--color-cream)]'
          }`}
        >
          <span
            className={`text-sm ${m.value === 'arabic' || m.value === 'bilingual' ? '' : ''}`}
            style={m.value !== 'thai' ? { fontFamily: "var(--font-amiri), 'Amiri', serif" } : {}}
          >
            {m.label}
          </span>
          <span className="text-[10px] opacity-70">{m.sublabel}</span>
        </button>
      ))}
    </div>
  );
}
