'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { allBooks } from '@/data/tafsir-sadi';
import { DisplayMode } from '@/lib/types';

function PrintContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookId = params.bookId as string;
  const book = allBooks.find((b) => b.id === bookId);
  const mode = (searchParams.get('mode') || 'bilingual') as DisplayMode;
  const volStr = searchParams.get('vol');
  const autoprint = searchParams.get('autoprint') === '1';

  // Auto-trigger print dialog
  useEffect(() => {
    if (autoprint) {
      const timer = setTimeout(() => window.print(), 800);
      return () => clearTimeout(timer);
    }
  }, [autoprint]);

  if (!book) return <p>ไม่พบหนังสือ</p>;

  let chapters = book.chapters;
  let volumeLabel = '';
  if (volStr) {
    const volNum = parseInt(volStr);
    const perVol = 10;
    const start = (volNum - 1) * perVol;
    chapters = book.chapters.slice(start, start + perVol);
    const totalVols = Math.ceil(book.chapters.length / perVol);
    volumeLabel = `เล่มที่ ${volNum} จาก ${totalVols}`;
  }

  // Thai mode: quran/hadith always show Arabic, tafsir Thai only
  const showAr = (type: string) => mode === 'arabic' || mode === 'bilingual' || type === 'quran' || type === 'hadith';
  const showTh = () => mode === 'thai' || mode === 'bilingual';

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');

        @page { size: A4; margin: 18mm 16mm 22mm 16mm; }
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
        }

        * { box-sizing: border-box; }
        body { font-family: 'Noto Sans Thai', sans-serif; color: #2C2417; background: white; margin: 0; padding: 0; font-size: 13px; line-height: 1.8; }
        .ar { font-family: 'Amiri', 'Traditional Arabic', serif; direction: rtl; text-align: right; line-height: 2.2; }

        .print-container { max-width: 175mm; margin: 0 auto; }

        /* Cover */
        .cover { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 92vh; text-align: center; page-break-after: always; }
        .cover-frame { border: 3px double #E8A04C; padding: 10px; }
        .cover-inner { border: 1px solid #E8A04C80; padding: 45px 35px; }
        .ornament-line { display: flex; align-items: center; gap: 8px; margin: 20px 0; }
        .ornament-line div { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #E8A04C); }
        .ornament-line div:last-child { background: linear-gradient(270deg, transparent, #E8A04C); }
        .ornament-line span { font-size: 12px; color: #E8A04C; }

        /* TOC */
        .toc { page-break-after: always; }
        .toc-item { display: flex; justify-content: space-between; align-items: baseline; padding: 7px 0; border-bottom: 1px dotted #ddd; page-break-inside: avoid; }

        /* Chapter */
        .ch-header { text-align: center; padding: 20px 0; page-break-inside: avoid; page-break-after: avoid; }

        /* Quran */
        .quran-box { background: #FFF5EB; border: 1px solid #F0D4B0; border-right: 4px solid #C75B12; border-radius: 0 6px 6px 0; padding: 14px 18px; margin: 12px 0; page-break-inside: avoid; }
        .quran-ref { font-size: 10px; color: #C75B12; font-weight: 600; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #F0D4B0; }

        /* Hadith */
        .hadith-box { background: #FEF3E2; border: 1px solid #E8C090; border-right: 4px solid #E8A04C; border-radius: 0 6px 6px 0; padding: 14px 18px; margin: 12px 0; page-break-inside: avoid; }

        /* Tafsir */
        .tafsir-block { margin: 12px 0; padding-left: 14px; border-left: 2px solid #E8A04C40; page-break-inside: avoid; }

        .text-ar-lg { font-size: 18px; line-height: 2.2; color: #1a1a1a; }
        .text-ar-md { font-size: 15px; line-height: 2.0; color: #2a2a2a; }
        .text-th { font-size: 13px; line-height: 1.85; color: #444; }
        .text-th-title { font-size: 13px; font-weight: 600; color: #2C2417; }
        .separator { height: 1px; background: linear-gradient(90deg, transparent, #E8A04C40, transparent); margin: 10px 0; }

        .print-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: #C75B12; color: white; padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
      `}</style>

      {/* Print bar */}
      <div className="print-bar no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => window.close()} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px' }}>✕ ปิด</button>
          <span style={{ fontSize: '13px', opacity: 0.8 }}>{book.titleTh} {volumeLabel && `(${volumeLabel})`}</span>
        </div>
        <button onClick={() => window.print()} style={{ background: 'white', color: '#C75B12', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
          บันทึกเป็น PDF
        </button>
      </div>

      <div className="print-container" style={{ paddingTop: '50px' }}>
        {/* ===== COVER ===== */}
        <div className="cover">
          <p className="ar" style={{ fontSize: '18px', color: '#E8A04C', marginBottom: '20px' }}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>

          <div className="cover-frame" style={{ width: '85%' }}>
            <div className="cover-inner">
              <div className="ornament-line"><div /><span>✦</span><div /></div>
              <p className="ar" style={{ fontSize: '24px', fontWeight: 'bold', color: '#C75B12', margin: '0 0 10px', lineHeight: '1.8' }}>{book.titleAr}</p>
              <div style={{ width: '80px', height: '2px', background: 'linear-gradient(90deg, transparent, #E8A04C, transparent)', margin: '12px auto' }} />
              <p style={{ fontSize: '17px', fontWeight: 600, color: '#2C2417', margin: '10px 0 20px' }}>{book.titleTh}</p>
              <div style={{ background: '#E8A04C15', borderRadius: '8px', padding: '10px 20px', display: 'inline-block' }}>
                <p className="ar" style={{ fontSize: '14px', color: '#666', margin: '0 0 4px' }}>{book.authorAr}</p>
                <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{book.authorTh}</p>
              </div>
              {volumeLabel && (
                <div style={{ marginTop: '20px' }}>
                  <span style={{ border: '2px solid #C75B12', borderRadius: '8px', padding: '8px 24px', fontSize: '15px', fontWeight: 700, color: '#C75B12' }}>{volumeLabel}</span>
                </div>
              )}
              <div className="ornament-line"><div /><span>✦</span><div /></div>
            </div>
          </div>
        </div>

        {/* ===== TOC ===== */}
        <div className="toc">
          <h2 style={{ textAlign: 'center', fontSize: '17px', color: '#C75B12', margin: '0 0 6px' }}>สารบัญ</h2>
          <div style={{ width: '50px', height: '1.5px', background: '#E8A04C', margin: '0 auto 20px' }} />
          {chapters.map((ch, i) => (
            <div key={ch.id} className="toc-item">
              <span style={{ fontSize: '12px' }}>{i + 1}. {ch.titleTh}</span>
              <span className="ar" style={{ fontSize: '13px', color: '#888' }}>{ch.titleAr}</span>
            </div>
          ))}
        </div>

        {/* ===== CHAPTERS ===== */}
        {chapters.map((chapter) => (
          <div key={chapter.id}>
            <div className="page-break" />
            <div className="ch-header">
              <div className="ornament-line"><div /><span>✦</span><div /></div>
              <p className="ar" style={{ fontSize: '20px', fontWeight: 'bold', color: '#C75B12', margin: '0 0 6px' }}>{chapter.titleAr}</p>
              <div style={{ width: '50px', height: '1.5px', background: '#E8A04C', margin: '6px auto' }} />
              <p style={{ fontSize: '15px', fontWeight: 600, margin: '6px 0 0' }}>{chapter.titleTh}</p>
              <div className="ornament-line"><div /><span>✦</span><div /></div>
            </div>

            {chapter.sections.map((section) => {
              if (section.type === 'quran') {
                return (
                  <div key={section.id} className="quran-box">
                    {section.reference && <div className="quran-ref">﴿ {section.reference} ﴾</div>}
                    <p className="ar text-ar-lg" style={{ fontWeight: 'bold', margin: '0 0 8px' }}>{section.contentAr}</p>
                    <p className="text-th">{section.contentTh}</p>
                  </div>
                );
              }
              if (section.type === 'hadith') {
                return (
                  <div key={section.id} className="hadith-box">
                    {section.reference && <div className="quran-ref" style={{ color: '#E8A04C', borderColor: '#E8C090' }}>📜 {section.reference}</div>}
                    <p className="ar text-ar-lg" style={{ margin: '0 0 8px' }}>{section.contentAr}</p>
                    <p className="text-th">{section.contentTh}</p>
                  </div>
                );
              }
              return (
                <div key={section.id} className="tafsir-block">
                  {section.titleAr && showAr(section.type) && <p className="ar" style={{ fontSize: '14px', fontWeight: 'bold', color: '#2C2417', margin: '0 0 4px' }}>{section.titleAr}</p>}
                  {section.titleTh && showTh() && <p className="text-th-title" style={{ margin: '0 0 4px' }}>{section.titleTh}</p>}
                  {showAr(section.type) && <p className="ar text-ar-md" style={{ margin: '0 0 6px' }}>{section.contentAr}</p>}
                  {showTh() && <p className="text-th">{section.contentTh}</p>}
                  {mode === 'bilingual' && <div className="separator" />}
                </div>
              );
            })}
          </div>
        ))}

        {/* Back cover */}
        <div className="page-break" />
        <div style={{ textAlign: 'center', paddingTop: '40vh' }}>
          <div className="ornament-line" style={{ maxWidth: '200px', margin: '0 auto' }}><div /><span>✦</span><div /></div>
          <p style={{ fontSize: '11px', color: '#888', marginTop: '16px' }}>คำแปลอัลกุรอานอ้างอิงจาก quran.com</p>
        </div>
      </div>
    </>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<p style={{ textAlign: 'center', padding: '40px' }}>กำลังโหลด...</p>}>
      <PrintContent />
    </Suspense>
  );
}
