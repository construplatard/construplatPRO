# CONSTRUPLATA ERP

Aplicación web para una pequeña empresa de construcción, remodelación e ingeniería civil.

## Módulos incluidos

- Dashboard financiero
- Clientes
- Cotizaciones
- Proyectos y avance físico
- Bitácoras de obra
- Cobros y avances de clientes
- Facturación
- Gastos
- Contratistas
- Caja y bancos
- Reportes imprimibles/PDF
- Configuración

No incluye empleados, nómina ni inventario.

## Ejecutar localmente

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Subir a GitHub

```bash
git init
git add .
git commit -m "CONSTRUPLATA ERP v1"
git branch -M main
git remote add origin https://github.com/construplatard/construplata-erp.git
git push -u origin main
```

## Desplegar en Vercel

Importar el repositorio desde Vercel. No requiere variables de entorno en esta versión.

## Almacenamiento

Esta versión guarda los registros con `localStorage` en el navegador. Para uso multiusuario, autenticación, archivos y sincronización entre dispositivos, la siguiente etapa es conectar Supabase.
