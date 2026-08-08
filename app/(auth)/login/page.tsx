'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'حدث خطأ غير متوقع');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] text-center mb-6">
        تسجيل الدخول
      </h2>
      {error && <Alert message={error} />}
      <Input
        label="البريد الإلكتروني"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        icon={<Mail className="w-4 h-4" />}
      />
      <Input
        label="كلمة المرور"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        icon={<Lock className="w-4 h-4" />}
      />
      <div className="flex items-center justify-end text-sm">
        <Link href="/forgot-password" className="text-[var(--brand-gold)] hover:underline">
          نسيت كلمة المرور؟
        </Link>
      </div>
      <Button type="submit" isLoading={loading} className="w-full">
        دخول
      </Button>
      <p className="text-center text-sm text-[var(--text-muted)]">
        ليس لديك حساب؟{' '}
        <Link href="/register" className="text-[var(--brand-gold)] hover:underline font-medium">
          إنشاء حساب جديد
        </Link>
      </p>
    </form>
  );
}
