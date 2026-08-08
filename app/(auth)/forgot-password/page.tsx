'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setMessage('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] text-center mb-6">
        استعادة كلمة المرور
      </h2>
      {error && <Alert message={error} />}
      {message && <Alert type="success" message={message} />}
      <p className="text-sm text-[var(--text-muted)]">
        أدخل بريدك الإلكتروني وسنرسل لك تعليمات لإعادة تعيين كلمة المرور.
      </p>
      <Input label="البريد الإلكتروني" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<Mail className="w-4 h-4" />} />
      <Button type="submit" isLoading={loading} className="w-full">
        إرسال الرابط
      </Button>
    </form>
  );
}
