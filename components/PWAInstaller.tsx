'use client';

import { useEffect, useState } from 'react';
import { Download, RefreshCw, Smartphone, X } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
};

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

export default function PWAInstaller() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());

    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;
    let refreshing = false;

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        await registration.update();

        if (registration.waiting) {
          setUpdateReady(true);
        }

        registration.addEventListener('updatefound', () => {
          const worker = registration?.installing;
          if (!worker) return;

          worker.addEventListener('statechange', () => {
            if (
              worker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              setUpdateReady(true);
            }
          });
        });
      } catch (error) {
        console.error('No se pudo registrar la aplicación:', error);
      }
    };

    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setHidden(false);
    };

    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowIosHelp(false);
    };

    register();

    navigator.serviceWorker.addEventListener(
      'controllerchange',
      onControllerChange
    );
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        onControllerChange
      );
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === 'accepted') {
        setInstalled(true);
      }

      setInstallPrompt(null);
      return;
    }

    const isAppleMobile =
      /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAppleMobile) {
      setShowIosHelp(true);
      return;
    }

    window.alert(
      'Abre el menú del navegador y selecciona “Instalar aplicación” o “Agregar a pantalla de inicio”.'
    );
  };

  const applyUpdate = () => {
    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        registration?.waiting?.postMessage({
          type: 'SKIP_WAITING',
        });
      });
  };

  if (installed || hidden) return null;

  return (
    <>
      <div className="install-card">
        <button
          className="close"
          onClick={() => setHidden(true)}
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>

        <div className="icon">
          {updateReady ? (
            <RefreshCw size={22} />
          ) : (
            <Smartphone size={22} />
          )}
        </div>

        <div className="copy">
          <b>
            {updateReady
              ? 'Nueva versión disponible'
              : 'Instalar CONSTRUPLATA PRO'}
          </b>
          <span>
            {updateReady
              ? 'Actualiza para ver los últimos cambios.'
              : 'Úsala como una app en móvil, tablet o PC.'}
          </span>
        </div>

        <button
          className="action"
          onClick={updateReady ? applyUpdate : install}
        >
          {updateReady ? (
            <RefreshCw size={16} />
          ) : (
            <Download size={16} />
          )}
          {updateReady ? 'Actualizar' : 'Instalar'}
        </button>
      </div>

      {showIosHelp && (
        <div className="ios-overlay" onClick={() => setShowIosHelp(false)}>
          <div className="ios-modal" onClick={(event) => event.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowIosHelp(false)}
            >
              <X size={18} />
            </button>

            <div className="modal-icon">
              <Smartphone size={26} />
            </div>

            <h3>Instalar en iPhone o iPad</h3>
            <p>
              Abre esta página en Safari, toca <b>Compartir</b>, selecciona
              <b> Agregar a pantalla de inicio</b>, activa
              <b> Abrir como app web</b> y toca <b>Agregar</b>.
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        .install-card {
          position: fixed;
          z-index: 1200;
          right: 18px;
          bottom: 18px;
          width: min(440px, calc(100vw - 36px));
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
          box-sizing: border-box;
          padding: 13px 14px;
          border: 1px solid rgba(125, 210, 255, 0.22);
          border-radius: 18px;
          color: #fff;
          background:
            radial-gradient(
              circle at top right,
              rgba(73, 195, 255, 0.25),
              transparent 38%
            ),
            linear-gradient(135deg, #061a34, #0a4b82);
          box-shadow: 0 18px 55px rgba(3, 34, 68, 0.34);
          animation: enter 0.35s ease;
        }

        .close {
          position: absolute;
          top: 7px;
          right: 7px;
          display: grid;
          place-items: center;
          padding: 4px;
          border: 0;
          border-radius: 999px;
          color: rgba(255, 255, 255, 0.65);
          background: transparent;
          cursor: pointer;
        }

        .icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: #06315c;
          background: linear-gradient(135deg, #f2fbff, #91ddff);
        }

        .copy {
          min-width: 0;
          padding-right: 6px;
        }

        .copy b,
        .copy span {
          display: block;
        }

        .copy b {
          font-size: 13px;
        }

        .copy span {
          margin-top: 3px;
          color: rgba(255, 255, 255, 0.68);
          font-size: 11px;
          line-height: 1.35;
        }

        .action {
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 12px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 11px;
          color: #fff;
          background: rgba(255, 255, 255, 0.12);
          font-weight: 900;
          cursor: pointer;
        }

        .ios-overlay {
          position: fixed;
          inset: 0;
          z-index: 1400;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(3, 18, 34, 0.72);
        }

        .ios-modal {
          position: relative;
          width: min(100%, 430px);
          box-sizing: border-box;
          padding: 27px;
          border: 1px solid var(--line);
          border-radius: 22px;
          color: var(--text);
          background: var(--card);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35);
        }

        .modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          display: grid;
          place-items: center;
          padding: 7px;
          border: 0;
          border-radius: 10px;
          color: var(--text);
          background: var(--surface);
          cursor: pointer;
        }

        .modal-icon {
          width: 55px;
          height: 55px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          color: #fff;
          background: linear-gradient(135deg, #1769e0, #17a3df);
        }

        h3 {
          margin: 17px 0 0;
          color: var(--text);
        }

        p {
          margin: 10px 0 0;
          color: var(--muted);
          line-height: 1.6;
        }

        @keyframes enter {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 620px) {
          .install-card {
            left: 12px;
            right: 12px;
            bottom: 12px;
            width: auto;
            grid-template-columns: auto 1fr;
          }

          .action {
            grid-column: 1 / -1;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
