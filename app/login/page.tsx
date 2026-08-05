'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type RoleJoin = { nombre?: string } | { nombre?: string }[] | null;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        router.replace('/dashboard');
      }
    });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const correo = email.trim().toLowerCase();
    const clave = password;

    if (!correo || !clave) {
      setMessage('Completa el correo y la contraseña.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: clave,
    });

    const projectRef =
      process.env.NEXT_PUBLIC_SUPABASE_URL
        ?.replace('https://', '')
        .split('.')[0] || 'sin-project-ref';

    if (error || !data.user) {
      setMessage(
        `${error?.message || 'No se pudo iniciar sesión'} | Proyecto conectado: ${projectRef}`
      );
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id,nombre,correo,activo,es_super_admin,roles(nombre)')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profile?.activo === false) {
      await supabase.auth.signOut();
      setMessage('Este usuario está desactivado.');
      setLoading(false);
      return;
    }

    const roles = profile?.roles as RoleJoin;
    const roleName = Array.isArray(roles)
      ? roles[0]?.nombre
      : roles?.nombre;

    localStorage.setItem('cp-auth', '1');
    localStorage.setItem(
      'cp-user',
      JSON.stringify({
        id: data.user.id,
        nombre:
          profile?.nombre ||
          data.user.user_metadata?.nombre ||
          data.user.email?.split('@')[0] ||
          'Usuario',
        correo: profile?.correo || data.user.email || '',
        rol:
          roleName ||
          (profile?.es_super_admin ? 'Administrador' : 'Usuario'),
      })
    );

    router.replace('/dashboard');
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

        <div className="brand-copy">
          <span>ERP DE CONSTRUCCIÓN</span>
          <h1>
            Construye con control.
            <em> Decide con datos.</em>
          </h1>
          <p>
            Proyectos, cotizaciones, finanzas y seguimiento de obra
            sincronizados desde cualquier dispositivo.
          </p>
        </div>
      </section>

      <section className="form-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="secure">
            <ShieldCheck size={17} />
            Acceso seguro con Supabase
          </div>

          <h2>Bienvenido</h2>
          <p>Ingresa con el usuario creado en Authentication.</p>

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
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Ver contraseña'
                }
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>

          {message && <div className="message">{message}</div>}

          <button className="submit" type="submit" disabled={loading}>
            {loading ? 'Validando...' : 'Entrar al sistema'}
            <LogIn size={19} />
          </button>

          <small>
            El mensaje de error mostrará el proyecto Supabase conectado.
          </small>
        </form>
      </section>

      <style jsx>{`
        .login-page {
          min-height: 100dvh;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          background: #f2f5f7;
        }

        .brand-panel {
          padding: 46px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: white;
          background:
            linear-gradient(145deg, rgba(5, 25, 31, 0.96), rgba(13, 67, 72, 0.9)),
            url('/construction-bg.jpg') center/cover;
        }

        .brand-wrap {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .brand-wrap img {
          width: 112px;
          height: 112px;
          object-fit: contain;
          padding: 8px;
          border-radius: 24px;
          background: white;
        }

        .brand-wrap strong,
        .brand-wrap span {
          display: block;
        }

        .brand-wrap strong {
          font-size: 24px;
          letter-spacing: 0.04em;
        }

        .brand-wrap span {
          margin-top: 5px;
          opacity: 0.76;
        }

        .brand-copy {
          max-width: 660px;
          margin: auto 0;
        }

        .brand-copy > span {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.17em;
          opacity: 0.75;
        }

        .brand-copy h1 {
          margin: 18px 0;
          font-size: clamp(44px, 5vw, 74px);
          line-height: 0.98;
        }

        .brand-copy em {
          display: block;
          color: #9dd7c4;
          font-style: normal;
        }

        .brand-copy p {
          max-width: 560px;
          font-size: 18px;
          line-height: 1.6;
          opacity: 0.8;
        }

        .form-panel {
          padding: 28px;
          display: grid;
          place-items: center;
        }

        .login-card {
          width: min(100%, 440px);
          padding: 36px;
          border: 1px solid #dde5e7;
          border-radius: 28px;
          background: white;
          box-shadow: 0 24px 60px rgba(13, 40, 44, 0.12);
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
          margin: 24px 0 6px;
          color: #102f33;
          font-size: 34px;
        }

        .login-card > p {
          margin: 0 0 26px;
          color: #6b7d80;
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
          border: 1px solid #cedbdd;
          border-radius: 14px;
          outline: none;
          font-size: 16px;
        }

        input:focus {
          border-color: #168b75;
          box-shadow: 0 0 0 4px rgba(22, 139, 117, 0.11);
        }

        .password-wrap {
          position: relative;
        }

        .password-wrap button {
          position: absolute;
          top: 50%;
          right: 11px;
          transform: translateY(-50%);
          display: grid;
          place-items: center;
          border: 0;
          background: transparent;
          color: #607679;
          cursor: pointer;
        }

        .message {
          margin-top: 18px;
          padding: 12px 13px;
          border-radius: 12px;
          color: #8f2626;
          background: #fff0f0;
          font-size: 12px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .submit {
          width: 100%;
          min-height: 54px;
          margin-top: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 0;
          border-radius: 15px;
          color: white;
          background: #0e7866;
          font-weight: 900;
          cursor: pointer;
        }

        .submit:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        small {
          display: block;
          margin-top: 16px;
          color: #7a8c8f;
          text-align: center;
          line-height: 1.45;
        }

        @media (max-width: 800px) {
          .login-page {
            display: block;
            background: #eef3f4;
          }

          .brand-panel {
            min-height: 220px;
            padding: 22px 18px 48px;
            align-items: center;
            justify-content: flex-start;
          }

          .brand-wrap {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }

          .brand-wrap img {
            width: 108px;
            height: 108px;
          }

          .brand-wrap strong {
            font-size: 21px;
          }

          .brand-wrap span,
          .brand-copy {
            display: none;
          }

          .form-panel {
            margin-top: -32px;
            padding: 0 14px 28px;
            position: relative;
          }

          .login-card {
            padding: 26px 20px;
            border-radius: 24px;
          }

          h2 {
            font-size: 28px;
          }
        }
      `}</style>
    </main>
  );
}
