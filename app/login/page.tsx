'use client';

import { FormEvent, useState } from 'react';
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
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    const correo = email.trim().toLowerCase();

    if (!correo || !password) {
      setMessage(
        'Completa el correo y la contraseña.'
      );
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
          error?.message ===
            'Invalid login credentials'
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
          'Este usuario está desactivado.'
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
      <section className="blue-panel">
        <div className="brand">
          <img
            src="/logo-construplata.jpg"
            alt="CONSTRUPLATA"
          />

          <div>
            <strong>CONSTRUPLATA</strong>
            <span>
              Gestión y control de proyectos
            </span>
          </div>
        </div>

        <div className="hero-copy">
          <span className="eyebrow">
            PLATAFORMA EMPRESARIAL
          </span>

          <h1>
            Controla cada detalle.
            <em> Construye con visión.</em>
          </h1>

          <p>
            Proyectos, cotizaciones, finanzas,
            bitácoras y reportes en un solo sistema.
          </p>

          <div className="hero-tags">
            <span>Control</span>
            <span>Planificación</span>
            <span>Supervisión</span>
          </div>
        </div>

        <div className="brand-foot">
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
            Ingresa al sistema con tus credenciales.
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
          grid-template-columns:
            minmax(0, 1.15fr)
            minmax(420px, 0.85fr);
          overflow: hidden;
          background: #edf3f8;
        }

        .blue-panel {
          position: relative;
          z-index: 2;
          min-height: 100dvh;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 42px 92px 42px 44px;
          color: white;
          background:
            radial-gradient(
              circle at 18% 15%,
              rgba(77, 160, 255, 0.26),
              transparent 32%
            ),
            linear-gradient(
              145deg,
              #061c3f 0%,
              #0a3474 54%,
              #0d5caf 100%
            );
          clip-path: polygon(
            0 0,
            100% 0,
            87% 100%,
            0 100%
          );
        }

        .blue-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.035)
                1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.035)
                1px,
              transparent 1px
            );
          background-size: 48px 48px;
          mask-image: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.72),
            transparent
          );
        }

        .brand,
        .hero-copy,
        .brand-foot {
          position: relative;
          z-index: 1;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .brand img {
          width: 128px;
          height: 128px;
          object-fit: contain;
          padding: 9px;
          border-radius: 27px;
          background: white;
          box-shadow: 0 22px 50px
            rgba(0, 0, 0, 0.25);
        }

        .brand strong,
        .brand span {
          display: block;
        }

        .brand strong {
          font-size: 25px;
          letter-spacing: 0.055em;
        }

        .brand span {
          margin-top: 5px;
          opacity: 0.75;
        }

        .hero-copy {
          max-width: 660px;
          margin: auto 0;
        }

        .eyebrow {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.18em;
          opacity: 0.72;
        }

        .hero-copy h1 {
          margin: 18px 0;
          font-size: clamp(
            46px,
            5vw,
            76px
          );
          line-height: 0.98;
          letter-spacing: -0.045em;
        }

        .hero-copy em {
          display: block;
          color: #9ed0ff;
          font-style: normal;
        }

        .hero-copy p {
          max-width: 560px;
          margin: 0;
          font-size: 18px;
          line-height: 1.65;
          opacity: 0.82;
        }

        .hero-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 28px;
        }

        .hero-tags span {
          padding: 9px 13px;
          border: 1px solid
            rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          background:
            rgba(255, 255, 255, 0.08);
          font-size: 12px;
          font-weight: 800;
        }

        .brand-foot {
          font-size: 12px;
          opacity: 0.58;
        }

        .form-panel {
          position: relative;
          z-index: 1;
          display: grid;
          place-items: center;
          padding: 28px 34px 28px 0;
        }

        .login-card {
          width: min(100%, 440px);
          box-sizing: border-box;
          padding: 38px;
          border: 1px solid #d7e2ea;
          border-radius: 30px;
          background: rgba(
            255,
            255,
            255,
            0.97
          );
          box-shadow: 0 26px 70px
            rgba(23, 55, 91, 0.15);
          backdrop-filter: blur(14px);
        }

        .secure-badge {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 11px;
          border-radius: 999px;
          color: #0b4f98;
          background: #e8f2ff;
          font-size: 12px;
          font-weight: 900;
        }

        h2 {
          margin: 24px 0 7px;
          color: #12365e;
          font-size: 36px;
          letter-spacing: -0.03em;
        }

        .subtitle {
          margin: 0 0 26px;
          color: #6b7b8e;
          line-height: 1.55;
        }

        label {
          display: grid;
          gap: 8px;
          margin-top: 18px;
          color: #294565;
          font-size: 13px;
          font-weight: 900;
        }

        input {
          width: 100%;
          min-height: 54px;
          box-sizing: border-box;
          padding: 0 15px;
          border: 1px solid #cbd8e4;
          border-radius: 15px;
          outline: none;
          font-size: 16px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        input:focus {
          border-color: #1768be;
          box-shadow: 0 0 0 4px
            rgba(23, 104, 190, 0.12);
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
          color: #61758a;
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
          background: linear-gradient(
            135deg,
            #0b4d99,
            #1378d4
          );
          box-shadow: 0 14px 28px
            rgba(19, 120, 212, 0.24);
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
          color: #8291a0;
          text-align: center;
        }

        @media (max-width: 900px) {
          .login-page {
            display: block;
            min-height: 100dvh;
            overflow: auto;
            background:
              linear-gradient(
                180deg,
                #071e42 0,
                #0c4e99 250px,
                #edf3f8 250px
              );
          }

          .blue-panel {
            min-height: 250px;
            padding: 20px 18px 58px;
            align-items: center;
            justify-content: flex-start;
            clip-path: polygon(
              0 0,
              100% 0,
              100% 82%,
              0 100%
            );
          }

          .brand {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }

          .brand img {
            width: 112px;
            height: 112px;
            padding: 8px;
            border-radius: 25px;
          }

          .brand strong {
            font-size: 21px;
          }

          .brand span,
          .hero-copy,
          .brand-foot {
            display: none;
          }

          .form-panel {
            margin-top: -42px;
            padding: 0 14px 28px;
          }

          .login-card {
            width: 100%;
            max-width: 480px;
            padding: 27px 20px;
            border-radius: 25px;
            box-shadow: 0 20px 55px
              rgba(13, 47, 91, 0.18);
          }

          h2 {
            font-size: 29px;
          }

          input {
            min-height: 52px;
          }

          .login-button {
            min-height: 54px;
          }
        }

        @media (max-width: 380px) {
          .blue-panel {
            min-height: 225px;
          }

          .brand img {
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
