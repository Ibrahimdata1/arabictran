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
    <div className="inline-flex items-center rounded-lg border border-[var(--gold)]/20 bg-[var(--ivory)] p-0.5 shadow-sm">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          className={`relative flex flex-col items-center gap-0 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
            mode === m.value
              ? 'toggle-active'
              : 'text-[var(--ink-faint)] hover:text-[var(--midnight)]'
          }`}
        >
          <span
            className="text-xs"
            style={m.value !== 'thai' ? { fontFamily: "var(--font-amiri), 'Amiri', serif" } : {}}
          >
            {m.label}
          </span>
          <span className="text-[9px] opacity-60">{m.sublabel}</span>
        </button>
      ))}
    </div>
  );
}
