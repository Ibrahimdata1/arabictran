'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { allBooks } from '@/data/tafsir-sadi';
import { DisplayMode } from '@/lib/types';

function PrintContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookId = params.bookId as string;
  const book = allBooks.find((b) => b.id === bookId);
  const mode = (searchParams.get('mode') || 'bilingual') as DisplayMode;
  const volStr = searchParams.get('vol');

  if (!book) return <p>ไม่พบหนังสือ</p>;

  // Volume support
  let chapters = book.chapters;
  let volumeLabel = '';
  if (volStr) {
    const volNum = parseInt(volStr);
    const perVol = 10;
    const start = (volNum - 1) * perVol;
    const end = start + perVol;
    chapters = book.chapters.slice(start, end);
    const totalVols = Math.ceil(book.chapters.length / perVol);
    volumeLabel = `เล่มที่ ${volNum} จาก ${totalVols}`;
  }

  const showAr = mode === 'arabic' || mode === 'bilingual';
  const showTh = mode === 'thai' || mode === 'bilingual';

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');

        @page {
          size: A4;
          margin: 20mm 18mm 25mm 18mm;
        }

        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
        }

        body {
          font-family: 'Noto Sans Thai', sans-serif;
          color: #2C2417;
          background: white;
          margin: 0;
          padding: 0;
          font-size: 11px;
          line-height: 1.7;
        }

        .ar {
          font-family: 'Amiri', 'Traditional Arabic', serif;
          direction: rtl;
          text-align: right;
        }

        .print-container {
          max-width: 170mm;
          margin: 0 auto;
        }

        /* Cover page */
        .cover {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 90vh;
          text-align: center;
          page-break-after: always;
        }

        .cover-frame {
          border: 3px double #C4A35A;
          padding: 50px 40px;
          position: relative;
        }

        .cover-frame::before {
          content: '';
          position: absolute;
          inset: 6px;
          border: 1px solid #C4A35A60;
        }

        .cover-ornament {
          width: 120px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #C4A35A, transparent);
          margin: 16px auto;
        }

        /* TOC */
        .toc {
          page-break-after: always;
        }

        .toc-item {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 6px 0;
          border-bottom: 1px dotted #ddd;
          page-break-inside: avoid;
        }

        /* Chapter */
        .chapter-header {
          text-align: center;
          padding: 20px 0 16px 0;
          page-break-inside: avoid;
          page-break-after: avoid;
        }

        .chapter-border {
          border-top: 2px solid #0D7377;
          border-bottom: 2px solid #0D7377;
          padding: 16px 0;
          margin-bottom: 16px;
        }

        /* Quran verse */
        .quran-box {
          background: #F0F7F7;
          border-right: 3px solid #0D7377;
          border-radius: 0 6px 6px 0;
          padding: 12px 16px;
          margin: 10px 0;
          page-break-inside: avoid;
        }

        .quran-ref {
          font-size: 9px;
          color: #0D7377;
          font-weight: 600;
          margin-bottom: 6px;
          padding-bottom: 4px;
          border-bottom: 1px solid #C8E0E040;
        }

        /* Hadith */
        .hadith-box {
          background: #FFF8EC;
          border-right: 3px solid #C4A35A;
          border-radius: 0 6px 6px 0;
          padding: 12px 16px;
          margin: 10px 0;
          page-break-inside: avoid;
        }

        /* Tafsir text block */
        .tafsir-block {
          margin: 10px 0;
          page-break-inside: avoid;
        }

        .tafsir-block h3 {
          margin: 0 0 4px 0;
        }

        .tafsir-block p {
          margin: 0 0 6px 0;
        }

        .text-ar {
          font-size: 13px;
          line-height: 2.0;
          color: #1a1a1a;
        }

        .text-th {
          font-size: 11px;
          line-height: 1.8;
          color: #444;
        }

        .separator {
          height: 1px;
          background: linear-gradient(90deg, transparent, #C4A35A40, transparent);
          margin: 8px 0;
        }

        /* Page footer */
        .page-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 8px;
          color: #999;
          padding: 4px;
        }

        /* Print button */
        .print-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: #0D7377;
          color: white;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
      `}</style>

      {/* Print action bar - hidden in print */}
      <div className="print-bar no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => window.history.back()}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px' }}
          >
            ← กลับ
          </button>
          <span style={{ fontSize: '13px', opacity: 0.8 }}>
            {book.titleTh} {volumeLabel && `(${volumeLabel})`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => window.print()}
            style={{
              background: 'white',
              color: '#0D7377',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 20px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            🖨️ พิมพ์ / บันทึก PDF
          </button>
        </div>
      </div>

      <div className="print-container" style={{ paddingTop: '60px' }}>
        {/* ===== COVER PAGE ===== */}
        <div className="cover">
          <div className="cover-frame">
            {/* Bismillah */}
            <p className="ar" style={{ fontSize: '20px', color: '#C4A35A', marginBottom: '30px' }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>

            {/* Title Arabic */}
            <p className="ar" style={{ fontSize: '28px', fontWeight: 'bold', color: '#0D7377', margin: '0 0 8px 0' }}>
              {book.titleAr}
            </p>

            <div className="cover-ornament" />

            {/* Title Thai */}
            <p style={{ fontSize: '20px', fontWeight: 600, color: '#2C2417', margin: '8px 0' }}>
              {book.titleTh}
            </p>

            {/* Author */}
            <p className="ar" style={{ fontSize: '14px', color: '#666', margin: '20px 0 4px 0' }}>
              {book.authorAr}
            </p>
            <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>
              {book.authorTh}
            </p>

            {volumeLabel && (
              <p style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#0D7377',
                margin: '24px 0 0 0',
                padding: '8px 24px',
                border: '2px solid #0D737740',
                borderRadius: '8px',
                display: 'inline-block',
              }}>
                {volumeLabel}
              </p>
            )}

            <div className="cover-ornament" style={{ marginTop: '30px' }} />

            <p style={{ fontSize: '10px', color: '#999', margin: '16px 0 0 0' }}>
              ArabicTran - ห้องสมุดอิสลาม
            </p>
            <p style={{ fontSize: '9px', color: '#bbb' }}>
              arabictran.vercel.app
            </p>
          </div>
        </div>

        {/* ===== TABLE OF CONTENTS ===== */}
        <div className="toc">
          <h2 style={{ textAlign: 'center', fontSize: '18px', color: '#0D7377', marginBottom: '20px' }}>
            สารบัญ
          </h2>
          {chapters.map((ch, i) => (
            <div key={ch.id} className="toc-item">
              <span style={{ fontSize: '11px' }}>
                {i + 1}. {ch.titleTh}
              </span>
              <span className="ar" style={{ fontSize: '12px', color: '#666' }}>
                {ch.titleAr}
              </span>
            </div>
          ))}
        </div>

        {/* ===== CHAPTERS ===== */}
        {chapters.map((chapter) => (
          <div key={chapter.id}>
            {/* Chapter header */}
            <div className="page-break" />
            <div className="chapter-header">
              <div className="chapter-border">
                <p className="ar" style={{ fontSize: '22px', fontWeight: 'bold', color: '#0D7377', margin: '0 0 6px 0' }}>
                  {chapter.titleAr}
                </p>
                <div className="cover-ornament" />
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#2C2417', margin: '6px 0 0 0' }}>
                  {chapter.titleTh}
                </p>
              </div>
            </div>

            {/* Sections */}
            {chapter.sections.map((section) => {
              if (section.type === 'quran') {
                return (
                  <div key={section.id} className="quran-box">
                    {section.reference && (
                      <div className="quran-ref">📖 {section.reference}</div>
                    )}
                    {showAr && (
                      <p className="ar text-ar" style={{ margin: '0 0 6px 0' }}>{section.contentAr}</p>
                    )}
                    {showTh && (
                      <p className="text-th" style={{ margin: 0 }}>{section.contentTh}</p>
                    )}
                  </div>
                );
              }

              if (section.type === 'hadith') {
                return (
                  <div key={section.id} className="hadith-box">
                    {section.reference && (
                      <div className="quran-ref" style={{ color: '#C4A35A', borderColor: '#E8D5A840' }}>📜 {section.reference}</div>
                    )}
                    {showAr && (
                      <p className="ar text-ar" style={{ margin: '0 0 6px 0' }}>{section.contentAr}</p>
                    )}
                    {showTh && (
                      <p className="text-th" style={{ margin: 0 }}>{section.contentTh}</p>
                    )}
                  </div>
                );
              }

              return (
                <div key={section.id} className="tafsir-block">
                  {section.titleAr && showAr && (
                    <h3 className="ar" style={{ fontSize: '13px', fontWeight: 'bold', color: '#2C2417' }}>{section.titleAr}</h3>
                  )}
                  {section.titleTh && showTh && (
                    <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#2C2417' }}>{section.titleTh}</h3>
                  )}
                  {showAr && (
                    <p className="ar text-ar">{section.contentAr}</p>
                  )}
                  {showTh && (
                    <p className="text-th">{section.contentTh}</p>
                  )}
                  {mode === 'bilingual' && <div className="separator" />}
                </div>
              );
            })}
          </div>
        ))}

        {/* ===== BACK COVER ===== */}
        <div className="page-break" />
        <div style={{ textAlign: 'center', paddingTop: '40vh' }}>
          <div className="cover-ornament" />
          <p style={{ fontSize: '11px', color: '#666', margin: '16px 0' }}>
            คำแปลอัลกุรอานอ้างอิงจาก quran.com
          </p>
          <p style={{ fontSize: '11px', color: '#666' }}>
            ตัฟซีร อัส-สะอ์ดีย์ จาก Quran.com API
          </p>
          <p style={{ fontSize: '10px', color: '#999', marginTop: '20px' }}>
            ArabicTran © {new Date().getFullYear()}
          </p>
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
