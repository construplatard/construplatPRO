'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const frases = [
  {
    linea1: 'Planifica con',
    linea2: 'precisión.',
  },
  {
    linea1: 'Controla cada',
    linea2: 'obra.',
  },
  {
    linea1: 'Crece con',
    linea2: 'confianza.',
  },
];

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [fraseActual, setFraseActual] = useState(0);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setVisible(false);

      window.setTimeout(() => {
        setFraseActual(
          (actual) => (actual + 1) % frases.length
        );

        setVisible(true);
      }, 450);
    }, 10000);

    return () => {
      window.clearInterval(intervalo);
    };
  }, []);

  useEffect(() => {
    const revisarSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        localStorage.setItem('cp-auth', '1');
        router.replace('/dashboard');
      }
    };

    revisarSesion();
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const correoIngresado = email.trim().toLowerCase();

    if (!correoIngresado || !password) {
      setError('Completa el correo y la contraseña.');
      setLoading(false);
      return;
    }

    const { data, error: authError } =
      await supabase.auth.signInWithPassword({
        email: correoIngresado,
        password,
      });

    if (authError || !data.user) {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    const { data: perfil, error: perfilError } =
      await supabase
        .from('profiles')
        .select(
          'id,nombre,correo,rol,activo,proyectos,modulos,acciones'
        )
        .eq('id', data.user.id)
        .single();

    if (perfilError || !perfil) {
      await supabase.auth.signOut();
      setError('No se encontró el perfil de este usuario.');
      setLoading(false);
      return;
    }

    if (!perfil.activo) {
      await supabase.auth.signOut();
      setError(
        'Este usuario está desactivado. Contacta al administrador.'
      );
      setLoading(false);
      return;
    }

    localStorage.setItem('cp-auth', '1');
    localStorage.setItem(
      'cp-user',
      JSON.stringify({
        id: perfil.id,
        nombre: perfil.nombre,
        correo: perfil.correo,
        rol: perfil.rol,
        proyectos: perfil.proyectos || [],
        modulos: perfil.modulos || [],
        acciones: perfil.acciones || [],
      })
    );

    router.push('/dashboard');
  }

  const frase = frases[fraseActual];

  return (
    <div className="login-page">
      <section className="login-showcase">
        <div className="showcase-brand">
          <img
            src="/logo-construplata.jpg"
            alt="CONSTRUPLATA"
          />

          <span>CONSTRUPLATA</span>
        </div>

        <div className="showcase-copy">
          <span className="login-kicker">
            ERP DE CONSTRUCCIÓN
          </span>

          <div
            className={
              visible
                ? 'rotating-message visible'
                : 'rotating-message'
            }
          >
            <h1>
              {frase.linea1}
              <br />

              <em>{frase.linea2}</em>
            </h1>
          </div>

          <p>
            Cotizaciones, proyectos, bitácoras y
            finanzas en un solo centro de control.
          </p>

          <div className="phrase-indicators">
            {frases.map((_, index) => (
              <button
                key={index}
                type="button"
                className={
                  index === fraseActual
                    ? 'phrase-dot active'
                    : 'phrase-dot'
                }
                onClick={() => {
                  setVisible(false);

                  window.setTimeout(() => {
                    setFraseActual(index);
                    setVisible(true);
                  }, 250);
                }}
                aria-label={`Mostrar frase ${
                  index + 1
                }`}
              />
            ))}
          </div>

          <div className="showcase-chips">
            <span>Proyectos</span>
            <span>Finanzas</span>
            <span>Bitácoras</span>
          </div>
        </div>

        <div className="showcase-foot">
          Gestión inteligente para construir mejor.
        </div>
      </section>

      <section className="login-panel">
        <form
          className="login-card"
          onSubmit={submit}
        >
          <div className="secure-badge">
            <ShieldCheck size={16} />
            Acceso seguro
          </div>

          <h2>Bienvenido</h2>

          <p>
            Ingresa con el correo y la contraseña asignados.
          </p>

          <label>
            Correo electrónico

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="Ingrese su correo electrónico"
              autoComplete="email"
            />
          </label>

          <label>
            Contraseña

            <div className="password-field">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShow(!show)}
                title={
                  show
                    ? 'Ocultar contraseña'
                    : 'Ver contraseña'
                }
                aria-label={
                  show
                    ? 'Ocultar contraseña'
                    : 'Ver contraseña'
                }
              >
                {show ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </label>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Validando...' : 'Entrar al sistema'}
            <ArrowRight size={20} />
          </button>

          <small>
            © 2026 CONSTRUPLATA SRL · República
            Dominicana
          </small>
        </form>
      </section>

      <style jsx global>{`
        .showcase-brand {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .showcase-brand img {
          width: 132px !important;
          height: 132px !important;
          padding: 10px;
          object-fit: contain;
          border-radius: 28px !important;
          background: #ffffff;
          box-shadow: 0 22px 50px rgba(0, 0, 0, 0.24);
        }

        .showcase-brand span {
          font-size: 25px !important;
          font-weight: 900;
          letter-spacing: 0.055em;
        }

        @media (max-width: 900px) {
          .showcase-brand img {
            width: 100px !important;
            height: 100px !important;
            border-radius: 23px !important;
          }

          .showcase-brand span {
            font-size: 21px !important;
          }
        }

        @media (max-width: 620px) {
          .showcase-brand {
            gap: 14px;
          }

          .showcase-brand img {
            width: 82px !important;
            height: 82px !important;
            padding: 7px;
            border-radius: 20px !important;
          }

          .showcase-brand span {
            font-size: 18px !important;
          }
        }

        @media (max-width: 768px) {
          .login-page {
            min-height: 100dvh;
            display: block !important;
          }

          .login-showcase {
            min-height: 230px !important;
            padding: 22px 20px 28px !important;
          }

          .showcase-copy {
            display: none !important;
          }

          .showcase-foot {
            display: none !important;
          }

          .showcase-brand {
            justify-content: center;
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }

          .showcase-brand img {
            width: 112px !important;
            height: 112px !important;
          }

          .showcase-brand span {
            font-size: 21px !important;
          }

          .login-panel {
            min-height: calc(100dvh - 230px) !important;
            padding: 0 14px 28px !important;
            align-items: flex-start !important;
          }

          .login-card {
            width: 100% !important;
            max-width: 460px !important;
            margin: -22px auto 0 !important;
            padding: 26px 20px !important;
            border-radius: 24px !important;
          }

          .login-card h2 {
            font-size: 25px !important;
          }

          .login-card input {
            min-height: 50px;
            font-size: 16px;
          }

          .login-button {
            min-height: 52px;
          }
        }

      `}</style>
    </div>
  );
}
