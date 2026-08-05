import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type CreateUserBody = {
  nombre?: string;
  correo?: string;
  contrasena?: string;
  rol?: string;
  telefono?: string;
  cargo?: string;
  activo?: boolean;
  modulos?: string[];
  acciones?: string[];
};

export async function POST(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!url || !secretKey) {
      return NextResponse.json(
        {
          error:
            'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en Vercel.',
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as CreateUserBody;

    const nombre = body.nombre?.trim();
    const correo = body.correo?.trim().toLowerCase();
    const contrasena = body.contrasena || '';
    const rol = body.rol?.trim() || 'Ingeniero';

    if (!nombre || !correo || !contrasena) {
      return NextResponse.json(
        {
          error:
            'Nombre, correo y contraseña son obligatorios.',
        },
        { status: 400 }
      );
    }

    if (contrasena.length < 6) {
      return NextResponse.json(
        {
          error:
            'La contraseña debe tener al menos 6 caracteres.',
        },
        { status: 400 }
      );
    }

    const admin = createClient(url, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error: createError,
    } = await admin.auth.admin.createUser({
      email: correo,
      password: contrasena,
      email_confirm: true,
      user_metadata: {
        nombre,
        rol,
        telefono: body.telefono?.trim() || '',
        cargo: body.cargo?.trim() || '',
      },
    });

    if (createError || !user) {
      return NextResponse.json(
        {
          error:
            createError?.message ||
            'No se pudo crear el usuario.',
        },
        { status: 400 }
      );
    }

    const { data: roleRow } = await admin
      .from('roles')
      .select('id')
      .ilike('nombre', rol)
      .maybeSingle();

    const { error: profileError } = await admin
      .from('user_profiles')
      .upsert(
        {
          id: user.id,
          nombre,
          correo,
          rol_id: roleRow?.id || null,
          activo: body.activo !== false,
          es_super_admin:
            correo === 'admin@construplata.com',
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      await admin.auth.admin.deleteUser(user.id);

      return NextResponse.json(
        {
          error: `El usuario no pudo guardarse en user_profiles: ${profileError.message}`,
        },
        { status: 400 }
      );
    }

    const moduleNames = body.modulos || [];

    if (moduleNames.length) {
      const { data: modules } = await admin
        .from('modules')
        .select('id,nombre')
        .in('nombre', moduleNames);

      if (modules?.length) {
        await admin
          .from('user_module_permissions')
          .upsert(
            modules.map((module) => ({
              user_id: user.id,
              module_id: module.id,
              permitido: true,
            })),
            { onConflict: 'user_id,module_id' }
          );
      }
    }

    const actionNames = body.acciones || [];

    if (moduleNames.length && actionNames.length) {
      const [{ data: modules }, { data: actions }] =
        await Promise.all([
          admin
            .from('modules')
            .select('id,nombre')
            .in('nombre', moduleNames),
          admin
            .from('actions')
            .select('id,nombre')
            .in('nombre', actionNames),
        ]);

      if (modules?.length && actions?.length) {
        const rows = modules.flatMap((module) =>
          actions.map((action) => ({
            user_id: user.id,
            module_id: module.id,
            action_id: action.id,
            permitido: true,
          }))
        );

        await admin
          .from('user_action_permissions')
          .upsert(rows, {
            onConflict: 'user_id,module_id,action_id',
          });
      }
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        nombre,
        correo,
        rol,
        activo: body.activo !== false,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error interno al crear el usuario.',
      },
      { status: 500 }
    );
  }
}
