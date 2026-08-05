
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type RoleJoin =
  | { nombre?: string }
  | { nombre?: string }[]
  | null;

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    const revisarSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (active && session?.user) {
        localStorage.setItem('cp-auth', '1');
        router.replace('/dashboard');
      }
    };

    revisarSesion();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    const correo = email.trim().toLowerCase();

    if (!correo || !password) {
      setMessage('Completa el correo y la contraseña.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: correo,
          password,
        });

      if (error || !data.user) {
        setMessage(
          error?.message === 'Invalid login credentials'
            ? 'Correo o contraseña incorrectos.'
            : error?.message ||
                'No se pudo iniciar sesión.'
        );
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select(
          'id,nombre,correo,activo,es_super_admin,roles(nombre)'
        )
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile?.activo === false) {
        await supabase.auth.signOut();
        setMessage(
          'Este usuario está desactivado. Contacta al administrador.'
        );
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
          correo:
            profile?.correo ||
            data.user.email ||
            '',
          rol:
            roleName ||
            (profile?.es_super_admin
              ? 'Administrador'
              : data.user.user_metadata?.rol ||
                'Usuario'),
          esSuperAdmin:
            profile?.es_super_admin || false,
        })
      );

      router.replace('/dashboard');
    } catch {
      setMessage(
        'Ocurrió un error al conectar con el sistema.'
      );
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="brand-panel">
        <div className="brand-header">
          <img
            src="/logo-construplata.jpg"
            alt="CONSTRUPLATA"
          />

          <div>
            <strong>CONSTRUPLATA</strong>
            <span>Gestión integral de construcción</span>
          </div>
        </div>

        <div className="brand-copy">
          <span className="eyebrow">
            ERP DE CONSTRUCCIÓN
          </span>

          <h1>
            Control total de tus obras.
            <em> Desde cualquier lugar.</em>
          </h1>

          <p>
            Administra proyectos, cotizaciones,
            bitácoras, cobros, gastos y reportes desde
            computadora, tablet o teléfono.
          </p>

          <div className="feature-row">
            <span>Proyectos</span>
            <span>Finanzas</span>
            <span>Bitácoras</span>
          </div>
        </div>

        <div className="brand-footer">
          CONSTRUPLATA PRO · República Dominicana
        </div>
      </section>

      <section className="form-panel">
        <form
          className="login-card"
          onSubmit={handleSubmit}
        >
          <div className="secure-badge">
            <ShieldCheck size={17} />
            Acceso seguro
          </div>

          <h2>Bienvenido</h2>

          <p className="subtitle">
            Ingresa con el correo y la contraseña
            asignados.
          </p>

          <label>
            Correo electrónico

            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setMessage('');
              }}
              placeholder="admin@construplata.com"
              autoComplete="email"
            />
          </label>

          <label>
            Contraseña

            <div className="password-wrap">
              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setMessage('');
                }}
                placeholder="••••••••"
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                aria-label={
                  showPassword
                    ? 'Ocultar contraseña'
                    : 'Ver contraseña'
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </label>

          {message && (
            <div className="login-message">
              {message}
            </div>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Validando acceso...'
              : 'Entrar al sistema'}

            <ArrowRight size={20} />
          </button>

          <small>
            © 2026 CONSTRUPLATA SRL
          </small>
        </form>
      </section>

      <style jsx>{`
        .login-page {
          min-height: 100dvh;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          background: #eef3f4;
        }

        .brand-panel {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px;
          color: white;
          background:
            radial-gradient(
              circle at top right,
              rgba(77, 182, 172, 0.24),
              transparent 34%
            ),
            linear-gradient(
              145deg,
              #071f24 0%,
              #0d4f50 55%,
              #0b6d61 100%
            );
        }

        .brand-panel::after {
          content: '';
          position: absolute;
          right: -110px;
          bottom: -160px;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          border: 1px solid
            rgba(255, 255, 255, 0.12);
          box-shadow:
            0 0 0 48px
              rgba(255, 255, 255, 0.035),
            0 0 0 96px
              rgba(255, 255, 255, 0.025);
        }

        .brand-header {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .brand-header img {
          width: 122px;
          height: 122px;
          object-fit: contain;
          padding: 9px;
          border-radius: 27px;
          background: white;
          box-shadow: 0 18px 45px
            rgba(0, 0, 0, 0.25);
        }

        .brand-header strong,
        .brand-header span {
          display: block;
        }

        .brand-header strong {
          font-size: 25px;
          letter-spacing: 0.055em;
        }

        .brand-header span {
          margin-top: 5px;
          opacity: 0.72;
        }

        .brand-copy {
          position: relative;
          z-index: 1;
          max-width: 680px;
          margin: auto 0;
        }

        .eyebrow {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.18em;
          opacity: 0.72;
        }

        .brand-copy h1 {
          margin: 18px 0;
          font-size: clamp(
            44px,
            5.2vw,
            76px
          );
          line-height: 0.98;
          letter-spacing: -0.045em;
        }

        .brand-copy em {
          display: block;
          color: #a7e3d3;
          font-style: normal;
        }

        .brand-copy p {
          max-width: 580px;
          margin: 0;
          font-size: 18px;
          line-height: 1.65;
          opacity: 0.8;
        }

        .feature-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 28px;
        }

        .feature-row span {
          padding: 9px 13px;
          border: 1px solid
            rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          background:
            rgba(255, 255, 255, 0.08);
          font-size: 12px;
          font-weight: 800;
        }

        .brand-footer {
          position: relative;
          z-index: 1;
          font-size: 12px;
          opacity: 0.58;
        }

        .form-panel {
          display: grid;
          place-items: center;
          padding: 28px;
        }

        .login-card {
          width: min(100%, 440px);
          box-sizing: border-box;
          padding: 38px;
          border: 1px solid #dbe5e7;
          border-radius: 30px;
          background: rgba(
            255,
            255,
            255,
            0.96
          );
          box-shadow: 0 26px 70px
            rgba(16, 48, 53, 0.13);
          backdrop-filter: blur(14px);
        }

        .secure-badge {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 11px;
          border-radius: 999px;
          color: #0b6c5d;
          background: #e7f7f1;
          font-size: 12px;
          font-weight: 900;
        }

        h2 {
          margin: 24px 0 7px;
          color: #15383c;
          font-size: 36px;
          letter-spacing: -0.03em;
        }

        .subtitle {
          margin: 0 0 26px;
          color: #6d7f82;
          line-height: 1.55;
        }

        label {
          display: grid;
          gap: 8px;
          margin-top: 18px;
          color: #29464a;
          font-size: 13px;
          font-weight: 900;
        }

        input {
          width: 100%;
          min-height: 54px;
          box-sizing: border-box;
          padding: 0 15px;
          border: 1px solid #ccdadd;
          border-radius: 15px;
          outline: none;
          font-size: 16px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        input:focus {
          border-color: #188b75;
          box-shadow: 0 0 0 4px
            rgba(24, 139, 117, 0.11);
        }

        .password-wrap {
          position: relative;
        }

        .password-wrap button {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          display: grid;
          place-items: center;
          padding: 6px;
          border: 0;
          background: transparent;
          color: #61777a;
          cursor: pointer;
        }

        .login-message {
          margin-top: 18px;
          padding: 12px 13px;
          border-radius: 13px;
          color: #922d2d;
          background: #fff0f0;
          font-size: 13px;
          line-height: 1.45;
        }

        .login-button {
          width: 100%;
          min-height: 56px;
          margin-top: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 0;
          border-radius: 16px;
          color: white;
          background:
            linear-gradient(
              135deg,
              #0d7665,
              #10917a
            );
          box-shadow: 0 14px 28px
            rgba(13, 118, 101, 0.22);
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .login-button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        small {
          display: block;
          margin-top: 18px;
          color: #829194;
          text-align: center;
        }

        @media (max-width: 900px) {
          .login-page {
            display: block;
            background:
              linear-gradient(
                180deg,
                #0b4d4d 0,
                #0b665c 245px,
                #eef3f4 245px
              );
          }

          .brand-panel {
            min-height: 245px;
            box-sizing: border-box;
            padding: 20px 18px 52px;
            align-items: center;
            justify-content: flex-start;
            background:
              radial-gradient(
                circle at top right,
                rgba(104, 213, 187, 0.22),
                transparent 38%
              ),
              linear-gradient(
                145deg,
                #071f24,
                #0b665c
              );
          }

          .brand-panel::after {
            display: none;
          }

          .brand-header {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }

          .brand-header img {
            width: 112px;
            height: 112px;
            padding: 8px;
            border-radius: 25px;
          }

          .brand-header strong {
            font-size: 21px;
          }

          .brand-header span {
            display: none;
          }

          .brand-copy,
          .brand-footer {
            display: none;
          }

          .form-panel {
            position: relative;
            margin-top: -38px;
            padding: 0 14px 28px;
          }

          .login-card {
            width: 100%;
            max-width: 480px;
            padding: 27px 20px;
            border-radius: 25px;
            box-shadow: 0 20px 55px
              rgba(13, 47, 52, 0.16);
          }

          h2 {
            font-size: 29px;
          }

          .subtitle {
            margin-bottom: 22px;
          }

          input {
            min-height: 52px;
          }

          .login-button {
            min-height: 54px;
          }
        }

        @media (max-width: 380px) {
          .brand-panel {
            min-height: 220px;
          }

          .brand-header img {
            width: 96px;
            height: 96px;
          }

          .login-card {
            padding: 24px 17px;
          }
        }
      `}</style>
    </main>
  );
}
