'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, Gift } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password, referralCode }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'حدث خطأ غير متوقع');
      setSuccess('تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتفعيل الحساب قبل الدخول.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] text-center mb-6">
        إنشاء حساب جديد
      </h2>
      {error && <Alert message={error} />}
      {success && <Alert type="success" message={success} />}
      <Input label="الاسم الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} required icon={<User className="w-4 h-4" />} />
      <Input label="البريد الإلكتروني" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<Mail className="w-4 h-4" />} />
      <Input label="رقم الهاتف" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required icon={<Phone className="w-4 h-4" />} />
      <Input label="كلمة المرور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} icon={<Lock className="w-4 h-4" />} />
      <Input label="كود الإحالة (اختياري)" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} icon={<Gift className="w-4 h-4" />} />
      <Button type="submit" isLoading={loading} className="w-full">
        تسجيل
      </Button>
      <p className="text-center text-sm text-[var(--text-muted)]">
        لديك حساب بالفعل؟{' '}
        <Link href="/login" className="text-[var(--brand-gold)] hover:underline font-medium">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
