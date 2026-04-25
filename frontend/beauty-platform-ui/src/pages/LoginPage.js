import { useState } from 'react';
import { useLogin } from '../features/auth/hooks/useLogin';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate: login, isPending, error } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  const errorMessage = error?.response?.data?.message ?? (error ? 'Помилка входу' : '');

  return (
    <div
      className="flex flex-center"
      style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'var(--gradient-circle)',
          borderRadius: 'var(--border-radius-full)',
          zIndex: -1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          right: '-30%',
          width: '60%',
          height: '60%',
          background: 'var(--gradient-secondary)',
          borderRadius: 'var(--border-radius-full)',
          zIndex: -1,
        }}
      />

      <div className="card fade-in" style={{ width: '100%', maxWidth: 400 }}>
        <div className="card-header">
          <h1 className="card-title">Вхід</h1>
          <p className="card-subtitle">Увійдіть у свій обліковий запис</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {errorMessage && <p className="form-error">{errorMessage}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: 'var(--spacing-md)' }}
            disabled={isPending}
          >
            {isPending ? 'Вхід...' : 'Увійти'}
          </button>
        </form>

        <p className="text-center mt-lg text-secondary">
          Немає акаунту?{' '}
          <a href="/register" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>
            Зареєструватись
          </a>
        </p>
      </div>
    </div>
  );
}
