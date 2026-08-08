'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] text-center mb-6">
        تعيين كلمة مرور جديدة
      </h2>
      {error && <Alert message={error} />}
      <Input label="كلمة المرور الجديدة" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required icon={<Lock className="w-4 h-4" />} />
      <Input label="تأكيد كلمة المرور" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required icon={<Lock className="w-4 h-4" />} />
      <Button type="submit" isLoading={loading} className="w-full">
        تحديث كلمة المرور
      </Button>
    </form>
  );
}
