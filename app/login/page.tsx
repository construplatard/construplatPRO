'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

type UsuarioConfig = {
  id: string;
  nombre: string;
  correo: string;
  contrasena: string;
  rol: string;
  activo: boolean;
  proyectos: string[];
  modulos: string[];
  acciones: string[];
};

type ConfiguracionGuardada = {
  usuarios?: UsuarioConfig[];
};

const CONFIG_STORAGE_KEY = 'construplata-configuracion-v2';

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

  function getUsuariosGuardados(): UsuarioConfig[] {
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);

      if (!raw) return [];

      const config = JSON.parse(raw) as ConfiguracionGuardada;

      return Array.isArray(config.usuarios)
        ? config.usuarios
        : [];
    } catch {
      return [];
    }
  }

  function guardarSesion(usuario: UsuarioConfig) {
    localStorage.setItem('cp-auth', '1');

    localStorage.setItem(
      'cp-user',
      JSON.stringify({
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        proyectos: usuario.proyectos || [],
        modulos: usuario.modulos || [],
        acciones: usuario.acciones || [],
      })
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const correoIngresado = email.trim().toLowerCase();
    const contrasenaIngresada = password;

    if (!correoIngresado || !contrasenaIngresada) {
      setError('Completa el correo y la contraseña.');
      setLoading(false);
      return;
    }

    const esAdminPrincipal =
      correoIngresado === 'admin@construplata.com' &&
      contrasenaIngresada === 'Admin123*';

    if (esAdminPrincipal) {
      guardarSesion({
        id: 'admin-principal',
        nombre: 'Juan Carlos',
        correo: 'admin@construplata.com',
        contrasena: '',
        rol: 'Administrador',
        activo: true,
        proyectos: ['Todos'],
        modulos: ['Todos'],
        acciones: ['Todos'],
      });

      router.push('/dashboard');
      return;
    }

    const usuarios = getUsuariosGuardados();

    const usuario = usuarios.find(
      (item) =>
        item.correo?.trim().toLowerCase() === correoIngresado
    );

    if (!usuario) {
      setError('No existe un usuario registrado con ese correo.');
      setLoading(false);
      return;
    }

    if (!usuario.activo) {
      setError('Este usuario está desactivado. Contacta al administrador.');
      setLoading(false);
      return;
    }

    if (!usuario.contrasena) {
      setError(
        'Este usuario no tiene una contraseña configurada. Edítalo o créalo nuevamente.'
      );
      setLoading(false);
      return;
    }

    if (usuario.contrasena !== contrasenaIngresada) {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    guardarSesion(usuario);
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
    </div>
  );
}
