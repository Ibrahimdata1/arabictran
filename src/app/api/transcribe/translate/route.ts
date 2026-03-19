import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'ฟีเจอร์นี้ถูกย้ายไปที่หน้าสรุปหนังสือ' }, { status: 410 });
}
