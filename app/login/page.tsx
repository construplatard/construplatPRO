'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Esperando intento de acceso.');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus('Conectando con Supabase...');

    const correo = email.trim().toLowerCase();

    if (!correo || !password) {
      setStatus('Completa el correo y la contraseña.');
      setLoading(false);
      return;
    }

    const timeout = new Promise<never>((_, reject) => {
      window.setTimeout(
        () => reject(new Error('La conexión tardó más de 12 segundos.')),
        12000
      );
    });

    try {
      const result = await Promise.race([
        supabase.auth.signInWithPassword({
          email: correo,
          password,
        }),
        timeout,
      ]);

      const { data, error } = result;

      const projectRef =
        process.env.NEXT_PUBLIC_SUPABASE_URL
          ?.replace('https://', '')
          .split('.')[0] || 'sin-project-ref';

      if (error || !data.user) {
        setStatus(
          `${error?.message || 'No se pudo iniciar sesión'} | Proyecto: ${projectRef}`
        );
        setLoading(false);
        return;
      }

      localStorage.setItem('cp-auth', '1');
      localStorage.setItem(
        'cp-user',
        JSON.stringify({
          id: data.user.id,
          nombre:
            data.user.user_metadata?.nombre ||
            data.user.email?.split('@')[0] ||
            'Usuario',
          correo: data.user.email || '',
          rol:
            data.user.user_metadata?.rol ||
            (data.user.email?.toLowerCase() ===
            'admin@construplata.com'
              ? 'Administrador'
              : 'Usuario'),
        })
      );

      setStatus('Acceso correcto. Abriendo el sistema...');
      router.replace('/dashboard');
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado.'
      );
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="brand-panel">
        <div className="brand-wrap">
          <img src="/logo-construplata.jpg" alt="CONSTRUPLATA" />
          <div>
            <strong>CONSTRUPLATA</strong>
            <span>Control profesional de obras</span>
          </div>
        </div>
      </section>

      <section className="form-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="secure">
            <ShieldCheck size={17} />
            Prueba directa de acceso
          </div>

          <h2>Bienvenido</h2>
          <p>Ingresa con el usuario creado en Supabase Authentication.</p>

          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@construplata.com"
              autoComplete="email"
            />
          </label>

          <label>
            Contraseña
            <div className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>

          <div className="status-box">{status}</div>

          <button className="submit" type="submit" disabled={loading}>
            {loading ? 'Probando conexión...' : 'Entrar al sistema'}
            <LogIn size={19} />
          </button>
        </form>
      </section>

      <style jsx>{`
        .login-page {
          min-height: 100dvh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #eef3f4;
        }

        .brand-panel {
          display: grid;
          place-items: center;
          padding: 30px;
          background: linear-gradient(145deg, #081f24, #0e5b58);
        }

        .brand-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          color: white;
          text-align: center;
        }

        .brand-wrap img {
          width: 160px;
          height: 160px;
          object-fit: contain;
          padding: 10px;
          border-radius: 30px;
          background: white;
        }

        .brand-wrap strong {
          display: block;
          font-size: 28px;
          letter-spacing: 0.05em;
        }

        .brand-wrap span {
          display: block;
          margin-top: 5px;
          opacity: 0.75;
        }

        .form-panel {
          display: grid;
          place-items: center;
          padding: 24px;
        }

        .login-card {
          width: min(100%, 430px);
          padding: 34px;
          border-radius: 26px;
          background: white;
          box-shadow: 0 20px 50px rgba(20, 52, 57, 0.14);
        }

        .secure {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 11px;
          border-radius: 999px;
          color: #0a6b59;
          background: #e8f7f1;
          font-size: 12px;
          font-weight: 800;
        }

        h2 {
          margin: 22px 0 6px;
          color: #12363a;
          font-size: 34px;
        }

        p {
          margin: 0 0 24px;
          color: #6c7f82;
        }

        label {
          display: grid;
          gap: 8px;
          margin-top: 18px;
          color: #243f43;
          font-size: 13px;
          font-weight: 800;
        }

        input {
          width: 100%;
          min-height: 52px;
          box-sizing: border-box;
          padding: 0 14px;
          border: 1px solid #cfdcde;
          border-radius: 14px;
          font-size: 16px;
        }

        .password-wrap {
          position: relative;
        }

        .password-wrap button {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .status-box {
          margin-top: 18px;
          padding: 14px;
          border: 1px solid #d7e3e5;
          border-radius: 14px;
          color: #27494d;
          background: #f6f9fa;
          font-size: 13px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .submit {
          width: 100%;
          min-height: 54px;
          margin-top: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          border-radius: 15px;
          color: white;
          background: #0e7866;
          font-weight: 900;
          cursor: pointer;
        }

        .submit:disabled {
          opacity: 0.6;
        }

        @media (max-width: 800px) {
          .login-page {
            display: block;
          }

          .brand-panel {
            min-height: 210px;
            padding: 22px 18px 50px;
          }

          .brand-wrap img {
            width: 112px;
            height: 112px;
          }

          .brand-wrap strong {
            font-size: 21px;
          }

          .form-panel {
            margin-top: -30px;
            position: relative;
            padding: 0 14px 24px;
          }

          .login-card {
            padding: 25px 20px;
          }

          h2 {
            font-size: 28px;
          }
        }
      `}</style>
    </main>
  );
}
