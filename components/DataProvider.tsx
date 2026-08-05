'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { AppData } from '@/lib/types';
import { loadData, seedData } from '@/lib/store';
import { supabase } from '@/lib/supabase';

type DataContextValue = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  syncing: boolean;
  syncError: string;
};

const DataContext = createContext<DataContextValue | null>(null);

const LOCAL_KEY = 'construplata-data-v2';
const MIGRATION_KEY = 'construplata-supabase-migrated-v1';

function normalizeData(value: unknown): AppData {
  const source = (value || {}) as Partial<AppData>;

  return {
    clientes: Array.isArray(source.clientes) ? source.clientes : [],
    proyectos: Array.isArray(source.proyectos) ? source.proyectos : [],
    cotizaciones: Array.isArray(source.cotizaciones)
      ? source.cotizaciones
      : [],
    bitacoras: Array.isArray(source.bitacoras)
      ? source.bitacoras
      : [],
    movimientos: Array.isArray(source.movimientos)
      ? source.movimientos
      : [],
    facturas: Array.isArray(source.facturas) ? source.facturas : [],
    contratistas: Array.isArray(source.contratistas)
      ? source.contratistas
      : [],
  };
}

function hasUsefulData(value: AppData) {
  return (
    value.clientes.length > 0 ||
    value.proyectos.length > 0 ||
    value.cotizaciones.length > 0 ||
    value.bitacoras.length > 0 ||
    value.movimientos.length > 0 ||
    value.facturas.length > 0 ||
    value.contratistas.length > 0
  );
}

export function DataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<AppData>(seedData);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  const initializedRef = useRef(false);
  const applyingRemoteRef = useRef(false);
  const lastRemoteJsonRef = useRef('');
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      setSyncing(true);
      setSyncError('');

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (active) {
          setSyncError('Sesión no iniciada.');
          setReady(true);
          setSyncing(false);
        }
        return;
      }

      const { data: remoteRow, error } = await supabase
        .from('app_state')
        .select('data,updated_at')
        .eq('id', 1)
        .single();

      if (error) {
        if (active) {
          setSyncError(error.message);
          setReady(true);
          setSyncing(false);
        }
        return;
      }

      const remoteData = normalizeData(remoteRow?.data);
      const localData = normalizeData(loadData());
      const alreadyMigrated =
        localStorage.getItem(MIGRATION_KEY) === '1';

      let selectedData = remoteData;

      if (
        !alreadyMigrated &&
        hasUsefulData(localData) &&
        !hasUsefulData(remoteData)
      ) {
        const { error: migrationError } = await supabase
          .from('app_state')
          .update({
            data: localData,
            updated_by: session.user.id,
          })
          .eq('id', 1);

        if (!migrationError) {
          selectedData = localData;
          localStorage.setItem(MIGRATION_KEY, '1');
        } else if (active) {
          setSyncError(
            `No se pudieron migrar los datos locales: ${migrationError.message}`
          );
        }
      } else {
        localStorage.setItem(MIGRATION_KEY, '1');
      }

      if (!active) return;

      applyingRemoteRef.current = true;
      lastRemoteJsonRef.current = JSON.stringify(selectedData);
      setData(selectedData);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(selectedData));
      initializedRef.current = true;
      setReady(true);
      setSyncing(false);

      window.setTimeout(() => {
        applyingRemoteRef.current = false;
      }, 0);
    };

    initialize();

    const channel = supabase
      .channel('construplata-app-state')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'app_state',
          filter: 'id=eq.1',
        },
        (payload) => {
          const nextData = normalizeData(
            (payload.new as { data?: unknown })?.data
          );
          const nextJson = JSON.stringify(nextData);

          if (nextJson === lastRemoteJsonRef.current) return;

          applyingRemoteRef.current = true;
          lastRemoteJsonRef.current = nextJson;
          setData(nextData);
          localStorage.setItem(LOCAL_KEY, nextJson);

          window.setTimeout(() => {
            applyingRemoteRef.current = false;
          }, 0);
        }
      )
      .subscribe();

    const polling = window.setInterval(async () => {
      if (!initializedRef.current || applyingRemoteRef.current) return;

      const { data: remoteRow } = await supabase
        .from('app_state')
        .select('data')
        .eq('id', 1)
        .single();

      if (!remoteRow) return;

      const nextData = normalizeData(remoteRow.data);
      const nextJson = JSON.stringify(nextData);

      if (nextJson === lastRemoteJsonRef.current) return;

      applyingRemoteRef.current = true;
      lastRemoteJsonRef.current = nextJson;
      setData(nextData);
      localStorage.setItem(LOCAL_KEY, nextJson);

      window.setTimeout(() => {
        applyingRemoteRef.current = false;
      }, 0);
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(polling);
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (
      !ready ||
      !initializedRef.current ||
      applyingRemoteRef.current
    ) {
      return;
    }

    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(async () => {
      setSyncing(true);
      setSyncError('');

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setSyncError('La sesión expiró. Vuelve a iniciar sesión.');
        setSyncing(false);
        return;
      }

      const { error } = await supabase
        .from('app_state')
        .update({
          data,
          updated_by: session.user.id,
        })
        .eq('id', 1);

      if (error) {
        setSyncError(error.message);
      } else {
        lastRemoteJsonRef.current = JSON.stringify(data);
      }

      setSyncing(false);
    }, 500);
  }, [data, ready]);

  if (!ready) {
    return (
      <div className="boot">
        Conectando CONSTRUPLATA...
      </div>
    );
  }

  return (
    <DataContext.Provider
      value={{
        data,
        setData,
        syncing,
        syncError,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error('useData fuera de DataProvider');
  }

  return context;
}
