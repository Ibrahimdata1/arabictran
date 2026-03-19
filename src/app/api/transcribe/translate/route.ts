// Translation is now done client-side or via Claude Code CLI
// This route is kept as placeholder
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    error: 'ฟีเจอร์แปลอัตโนมัติถูกปิด — ใช้ปุ่ม "คัดลอกเพื่อแปล" แล้ววางใน Claude Code แทน'
  }, { status: 501 });
}
