'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

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

  function submit(e: React.FormEvent) {
    e.preventDefault();

    if (
      email.toLowerCase() ===
        'admin@construplata.com' &&
      password === 'Admin123*'
    ) {
      localStorage.setItem('cp-auth', '1');
      router.push('/dashboard');
      return;
    }

    setError('Correo o contraseña incorrectos');
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
            Ingresa a tu centro de control empresarial.
          </p>

          <label>
            Correo electrónico

           <input
  type="email"
  value={email}
  onChange={(e) =>
    setEmail(e.target.value)
  }
  placeholder="Ingrese su correo electrónico"
/>
          </label>

          <label>
            Contraseña

            <div className="password-field">
              <input
                type={
                  show ? 'text' : 'password'
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
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
          >
            Entrar al sistema
            <ArrowRight size={20} />
          </button>

          <small>
            © 2026 CONSTRUPLATA SRL · República
            Dominicana
          </small>
        </form>
      </section>
    </div>
  );
}
