# Builds con Variables de Entorno

Este proyecto está configurado para crear builds separados para desarrollo y producción con diferentes variables de entorno.

## Archivos de Configuración

- `.env` - Variables base compartidas por todos los entornos
- `.env.local` - Variables locales (solo para desarrollo local, no commitear)
- `.env.development` - Variables específicas para entorno de desarrollo
- `.env.production` - Variables específicas para entorno de producción

## Comandos de Build

### Build para Desarrollo

```bash
npm run build:dev
```

Este comando:

- Establece `NODE_ENV=development`
- Carga variables de `.env` + `.env.development` + `.env.local`
- Optimizado para debugging y desarrollo

### Build para Producción

```bash
npm run build
```

Este comando:

- Carga variables de `.env` + `.env.production`
- Optimizado para performance y producción

## Comandos de Start

### Start con configuración de desarrollo

```bash
npm run start:dev
```

### Start con configuración de producción

```bash
npm run start
```

## Orden de Precedencia de Variables

Next.js carga las variables de entorno en el siguiente orden (la última sobrescribe):

1. `.env`
2. `.env.local` (siempre ignorado por git)
3. `.env.development` o `.env.production` (dependiendo del NODE_ENV)
4. `.env.development.local` o `.env.production.local`

## Notas Importantes

- Las variables que empiezan con `NEXT_PUBLIC_` están disponibles en el navegador
- Las variables sin este prefijo solo están disponibles en el servidor
- Nunca commits archivos `.env.local` o que contengan secrets
- Los builds crean diferentes outputs optimizados según el entorno
