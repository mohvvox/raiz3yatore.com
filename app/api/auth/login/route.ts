import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان.' }, { status: 400 });
    }

    const identifier = email.toLowerCase();
    const admin = createAdminClient();

    const { data: attempt } = await admin
      .from('login_attempts')
      .select('*')
      .eq('identifier', identifier)
      .maybeSingle();

    if (attempt?.locked_until && new Date(attempt.locked_until) > new Date()) {
      return NextResponse.json(
        { success: false, error: `تم حظر الدخول مؤقتاً بسبب محاولات كثيرة فاشلة. حاول بعد ${LOCK_MINUTES} دقيقة.` },
        { status: 429 }
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const newCount = (attempt?.attempt_count || 0) + 1;
      await admin.from('login_attempts').upsert({
        identifier,
        attempt_count: newCount,
        last_attempt_at: new Date().toISOString(),
        locked_until: newCount >= MAX_ATTEMPTS
          ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString()
          : null,
      });
      return NextResponse.json({ success: false, error: 'بيانات الدخول غير صحيحة.' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('is_banned')
      .eq('id', data.user.id)
      .single();

    if (userData?.is_banned) {
      await supabase.auth.signOut();
      return NextResponse.json({ success: false, error: 'تم حظر حسابك. يرجى التواصل مع الدعم.' }, { status: 403 });
    }

    await admin.from('login_attempts').delete().eq('identifier', identifier);

    return NextResponse.json({ success: true, data: { user: data.user } });
  } catch (err) {
    console.error('Login Error:', err);
    return NextResponse.json({ success: false, error: 'حدث خطأ في الخادم.' }, { status: 500 });
  }
}
