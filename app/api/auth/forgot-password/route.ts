import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني مطلوب.' }, { status: 400 });
    }
    const supabase = createClient();
    const origin = request.headers.get('origin');
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/reset-password` });
    // دائماً نرجع نجاح حتى لو الإيميل غير موجود (لأسباب أمنية)
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'حدث خطأ في الخادم.' }, { status: 500 });
  }
}
