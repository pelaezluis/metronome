# Metrónomo

Un metrónomo web moderno construido con Vue 3 para gestionar canciones con sus respectivos BPM y tipos de compás, con almacenamiento en Supabase y autenticación por bandas.

## Características

- ✅ Autenticación por banda (nombre y contraseña)
- ✅ Registrar canciones con nombre, BPM, tipo de compás y grupo
- ✅ Lista de canciones ordenada alfabéticamente
- ✅ Filtrado por nombre o grupo
- ✅ Reproducción de metrónomo con sonido
- ✅ Diferentes tipos de compás (2/4, 3/4, 4/4, 5/4, 6/8, 7/8, 9/8, 12/8)
- ✅ Almacenamiento en Supabase (base de datos en la nube)
- ✅ Interfaz moderna con Tailwind CSS
- ✅ Diseño responsive para móviles
- ✅ Construido con Vue 3 + Vite
- ✅ Composition API para mejor organización del código

## Configuración

### 1. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Crea dos tablas en tu base de datos:

**Tabla `bands`:**
```sql
CREATE TABLE bands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  key TEXT NOT NULL,  -- o 'password' según tu estructura
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Tabla `songs`:**
```sql
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  group TEXT,
  bpm INTEGER NOT NULL,
  time_signature TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. Obtén tus credenciales de Supabase:
   - Ve a Settings > API en tu proyecto
   - Copia la **URL del proyecto** y la **anon/public key**

### 2. Configurar el proyecto

### Configurar variables de entorno

1. Copia el archivo `env.example` a `.env`:
```bash
cp env.example .env
```

2. Edita el archivo `.env` y completa tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

**Nota importante:** En proyectos Vue con Vite, las variables de entorno deben tener el prefijo `VITE_` para ser accesibles en el cliente. Vite leerá automáticamente estas variables desde el archivo `.env` cuando uses `npm run dev` o `npm run build`.

3. El archivo `.env` está en `.gitignore` por defecto para proteger tus credenciales.

### 3. Verificar configuración

- Asegúrate de que el campo de clave en la tabla `bands` se llame `key` o `password`. Si usa otro nombre, ajusta la verificación en `src/components/LoginScreen.vue`.

## Instalación

1. Clona o descarga el proyecto
2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno (ver sección de Configuración)
4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

5. Abre tu navegador en `http://localhost:3000`

## Uso

1. Inicia sesión con el nombre de tu banda y contraseña
2. Completa el formulario para agregar canciones:
   - Nombre de la canción (obligatorio)
   - Grupo (opcional)
   - BPM (obligatorio, entre 30-300)
   - Tipo de compás (obligatorio)
3. Haz clic en "Agregar Canción"
4. Para reproducir el metrónomo, haz clic en el botón "▶ Play" de la canción deseada
5. Para detener el metrónomo, haz clic en el botón "Detener" en el indicador flotante

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción

## Tecnologías

- **Vue 3** - Framework JavaScript progresivo
- **Vite** - Build tool y servidor de desarrollo
- **Tailwind CSS** - Framework de CSS utility-first
- **Supabase** - Base de datos y autenticación
- **Web Audio API** - Generación de sonidos del metrónomo
- **Composition API** - API de composición de Vue 3

## Estructura de Base de Datos

- **bands**: Almacena las bandas con nombre y clave
- **songs**: Almacena las canciones asociadas a cada banda

## Notas

- El metrónomo usa la Web Audio API para generar sonidos
- Los datos se guardan en Supabase (base de datos en la nube)
- Cada banda solo puede ver y gestionar sus propias canciones
- El primer beat de cada compás tiene un tono más fuerte para facilitar la identificación

