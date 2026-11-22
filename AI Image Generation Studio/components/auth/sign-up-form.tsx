'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { ApiClientError, clientApi } from '@/lib/client-api';
import { useSession } from '../session-provider';
import { Button } from '../ui/button';
import { Field } from '../ui/field';

export function SignUpForm() {
  const router = useRouter();
  const { user, refresh } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Enter an email address.');
      return;
    }
    if (password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }
    if (password !== confirm) {
      setError('The passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await clientApi.register({
        name: name.trim() || undefined,
        email: email.trim(),
        password,
      });
      await refresh();
      toast.success('Your workspace is ready.');
      router.push('/studio');
      router.refresh();
    } catch (registerError) {
      setError(
        registerError instanceof ApiClientError
          ? registerError.message
          : 'Could not create the account. Please try again.'
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
            Keep this workspace
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Your current guest images and favorites will stay attached to this account.
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

      <Field label="Name (optional)" htmlFor="name">
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={60}
          placeholder="Your name"
          className="input"
        />
      </Field>

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

      <Field label="Password" htmlFor="password" hint="At least 8 characters.">
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
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

      <Field label="Confirm password" htmlFor="confirm">
        <input
          id="confirm"
          name="confirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="Repeat the password"
          className="input"
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={submitting}>
        Create account
      </Button>

      <p className="text-center text-xs leading-relaxed text-muted">
        By creating an account you agree to use the studio responsibly and to keep the
        work you generate.
      </p>
    </form>
  );
}
