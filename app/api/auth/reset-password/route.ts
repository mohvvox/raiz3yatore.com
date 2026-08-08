import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' }, { status: 400 });
    }
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json({ success: false, error: 'انتهت صلاحية الجلسة أو الرابط غير صالح.' }, { status: 401 });
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      return NextResponse.json({ success: false, error: 'فشل تحديث كلمة المرور.' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'حدث خطأ في الخادم.' }, { status: 500 });
  }
}
