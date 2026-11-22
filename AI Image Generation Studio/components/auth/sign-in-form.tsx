'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { ApiClientError, clientApi } from '@/lib/client-api';
import { useSession } from '../session-provider';
import { Button } from '../ui/button';
import { Field } from '../ui/field';

interface SignInFormProps {
  redirectTo: string;
}

export function SignInForm({ redirectTo }: SignInFormProps) {
  const router = useRouter();
  const { user, refresh } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await clientApi.login(email.trim(), password);
      await refresh();
      toast.success('Welcome back.');
      router.push(redirectTo);
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof ApiClientError
          ? loginError.message
          : 'Could not sign in. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {user?.isGuest ? (
        <div className="rounded-[2px] border border-line bg-surface px-3 py-2.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-accent">
            Guest workspace detected
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            The images and favorites in this session will be merged into your account.
          </p>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-[2px] border border-danger/40 bg-surface px-3 py-2.5 text-xs leading-relaxed text-danger"
        >
          {error}
        </div>
      ) : null}

      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="input"
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            className="input pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-muted transition-colors hover:text-ink"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={submitting}>
        Sign in
      </Button>
    </form>
  );
}
