import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { fullName, email, phone, password, referralCode } = await request.json();
    if (!fullName || !email || !phone || !password) {
      return NextResponse.json({ success: false, error: 'جميع الحقول المطلوبة يجب ملؤها.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const supabase = await createClient();

    // نستخدم signUp العادية (مش admin.createUser) عشان Supabase يبعت إيميل التفعيل تلقائياً
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني مستخدم بالفعل أو غير صالح.' }, { status: 400 });
    }

    const userId = authData.user.id;

    let referrerId: string | null = null;
    if (referralCode) {
      const { data: referrer } = await admin
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .maybeSingle();
      if (referrer) referrerId = referrer.id;
    }

    // ملاحظة: صف users وصف wallets اتعملوا تلقائياً بواسطة trigger عند إنشاء المستخدم،
    // فهنا بنعمل UPDATE فقط للبيانات الإضافية، مش INSERT جديد.
    const { error: updateError } = await admin
      .from('users')
      .update({ full_name: fullName, phone, referred_by: referrerId })
      .eq('id', userId);

    if (updateError) {
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ success: false, error: 'فشل حفظ بيانات المستخدم.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { userId } });
  } catch (err) {
    console.error('Register Error:', err);
    return NextResponse.json({ success: false, error: 'حدث خطأ في الخادم.' }, { status: 500 });
  }
}
