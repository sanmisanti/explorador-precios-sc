# 🚀 Plan de Despliegue - Explorador de Precios

## 📋 Resumen del Proyecto
- **Aplicación:** Next.js con React
- **Base de datos actual:** SQL Server local
- **Funcionalidades:** Consulta de precios + Web scraping MercadoLibre
- **Objetivo:** Hacer la app accesible públicamente en internet

---

## 🎯 Opciones de Despliegue (Ordenadas por Facilidad)

### 🟢 OPCIÓN 1: Vercel + Supabase (RECOMENDADA - GRATIS)
**Tiempo estimado:** 2-3 horas  
**Costo:** $0/mes  
**Dificultad:** ⭐⭐☆☆☆

#### Frontend (Vercel):
- ✅ **Hosting gratuito** para Next.js
- ✅ **Deploy automático** desde GitHub
- ✅ **SSL incluido**
- ✅ **CDN global**
- ✅ **Serverless functions** para APIs

#### Base de Datos (Supabase):
- ✅ **PostgreSQL gratis** (500MB)
- ✅ **API automática**
- ✅ **Real-time subscriptions**
- ✅ **Authentication incluida**
- ✅ **Dashboard amigable**

---

### 🟡 OPCIÓN 2: Netlify + Supabase (ALTERNATIVA GRATIS)
**Tiempo estimado:** 3-4 horas  
**Costo:** $0/mes  
**Dificultad:** ⭐⭐⭐☆☆

#### Frontend (Netlify):
- ✅ **Hosting gratuito**
- ✅ **Functions serverless**
- ✅ **Forms y analytics**

#### Base de Datos (Supabase):
- ✅ **PostgreSQL gratis**
- ✅ **2GB storage**
- ✅ **API automática**
- ✅ **Real-time**

---

### 🟠 OPCIÓN 3: Railway (TODO EN UNO - SIMPLE)
**Tiempo estimado:** 1-2 horas  
**Costo:** $5/mes después de trial  
**Dificultad:** ⭐⭐☆☆☆

#### Características:
- ✅ **Deploy directo desde GitHub**
- ✅ **PostgreSQL incluido**
- ✅ **Variables de entorno fáciles**
- ✅ **Logs y monitoring**

---

### 🟠 OPCIÓN 4: Vercel + PlanetScale (YA NO GRATIS)
**Tiempo estimado:** 2-3 horas  
**Costo:** $29/mes (PlanetScale)  
**Dificultad:** ⭐⭐☆☆☆

#### Nota:
- ❌ **PlanetScale eliminó su plan gratuito**
- 💰 **Costo mínimo:** $29/mes
- ✅ **Sigue siendo una excelente opción** si tienes presupuesto

---

### 🔴 OPCIÓN 5: DigitalOcean Droplet (MÁS CONTROL)
**Tiempo estimado:** 4-6 horas  
**Costo:** $6/mes  
**Dificultad:** ⭐⭐⭐⭐☆

#### Características:
- ✅ **Control total del servidor**
- ✅ **Puedes usar cualquier BD**
- ✅ **Docker opcional**
- ❌ **Más configuración manual**

---

## 🗂️ Preparación de Datos

### Paso 1: Exportar Datos de SQL Server
```sql
-- Exportar tabla de clasificaciones
SELECT pl.IdClasificacion, c.Descripcion, COUNT(c.Descripcion) as Cantidad 
FROM pli.PliegoLinea pl
INNER JOIN rib.ItemInstanciado ii ON pl.IdClasificacion = ii.IdItemInstanciado
INNER JOIN rib.Clasificacion c ON ii.IdClasificacion = c.IdClasificacion
GROUP BY c.Descripcion, pl.IdClasificacion
ORDER BY COUNT(c.Descripcion) DESC;

-- Exportar datos principales (muestra)
SELECT TOP 1000 
    ii.Descripcion,
    plda.EspecificacionesTecnicas,
    plda.Observaciones,
    pl.PrecioUnitario,
    pl.NumeroLinea,
    p.NumeroPliego
FROM pli.PliegoLinea pl
-- ... resto de la consulta
```

### Paso 2: Convertir a Formato Compatible
- **CSV:** Para importación fácil
- **JSON:** Para seed scripts
- **SQL Insert:** Para cualquier BD SQL

---

## 🛠️ IMPLEMENTACIÓN DETALLADA - OPCIÓN 1 (Vercel + Supabase)

### PARTE A: Preparar el Repositorio

#### 1. Instalar Dependencias de Supabase
```bash
npm install @supabase/supabase-js
# o
yarn add @supabase/supabase-js
```

#### 2. Crear Repositorio en GitHub
```bash
# Si no tienes git inicializado
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/explorador-precios.git
git push -u origin main
```

#### 3. Modificar Variables de Entorno
Crear archivo `.env.local`:
```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@host:5432/database"
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"

# Para producción
NEXT_PUBLIC_APP_URL="https://tu-app.vercel.app"
```

### PARTE B: Configurar Supabase

#### 1. Crear Cuenta y Base de Datos
- Ir a [supabase.com](https://supabase.com)
- Crear cuenta gratuita
- Crear nuevo proyecto: `explorador-precios`
- Obtener URL y claves del dashboard

#### 2. Migrar Esquema y Datos
Usar el editor SQL de Supabase:
```sql
-- Crear tablas equivalentes (PostgreSQL)
CREATE TABLE clasificaciones (
    id INTEGER PRIMARY KEY,
    descripcion VARCHAR(500),
    cantidad INTEGER
);

CREATE TABLE pliego_data (
    id SERIAL PRIMARY KEY,
    clasificacion_id INTEGER,
    descripcion VARCHAR(1000),
    especificaciones TEXT,
    observaciones TEXT,
    precio_unitario NUMERIC(10,2),
    numero_linea INTEGER,
    numero_pliego VARCHAR(100),
    FOREIGN KEY (clasificacion_id) REFERENCES clasificaciones(id)
);
```

#### 3. Actualizar Código para PostgreSQL
Archivo `lib/database.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getDatabase() {
    return supabase;
}

export async function consultarPrecios(codigo) {
    const { data, error } = await supabase
        .from('pliego_data')
        .select(`
            descripcion,
            especificaciones,
            observaciones,
            precio_unitario,
            numero_linea,
            numero_pliego
        `)
        .eq('clasificacion_id', codigo)
        .limit(10);
    
    if (error) throw error;
    
    // Mapear para mantener compatibilidad con el código existente
    return data.map(row => ({
        Descripcion: row.descripcion,
        EspecificacionesTecnicas: row.especificaciones,
        Observaciones: row.observaciones,
        PrecioUnitario: row.precio_unitario,
        NumeroLinea: row.numero_linea,
        NumeroPliego: row.numero_pliego
         }));
}

// Función para obtener clasificaciones (actualizar también)
export async function obtenerClasificaciones() {
    const { data, error } = await supabase
        .from('clasificaciones')
        .select('id, descripcion, cantidad')
        .order('cantidad', { ascending: false });
    
    if (error) throw error;
    
    // Mapear para mantener compatibilidad
    return data.map(row => ({
        IdClasificacion: row.id,
        Descripcion: row.descripcion,
        Cantidad: row.cantidad
    }));
}
```

### PARTE C: Deploy en Vercel

#### 1. Conectar GitHub a Vercel
- Ir a [vercel.com](https://vercel.com)
- Conectar con GitHub
- Importar repositorio `explorador-precios`

#### 2. Configurar Variables de Entorno en Vercel
En el dashboard de Vercel:
```
DATABASE_URL=postgresql://tu-usuario:password@db.host.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
```

#### 3. Deploy Automático
- Vercel detectará Next.js automáticamente
- Deploy se ejecutará en cada push a main
- URL disponible en minutos

---

## 📦 Scripts de Migración

### Script para Convertir Datos SQL Server → PostgreSQL (Supabase)
```javascript
// scripts/migrate-data.js
const fs = require('fs');
const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Clave de servicio, no la anónima
);

async function migrateData() {
    // Conectar a SQL Server
    const sqlPool = await sql.connect(configSQLServer);
    
    // Migrar clasificaciones
    const clasificaciones = await sqlPool.request().query(`
        SELECT pl.IdClasificacion, c.Descripcion, COUNT(*) as Cantidad 
        FROM pli.PliegoLinea pl
        INNER JOIN rib.ItemInstanciado ii ON pl.IdClasificacion = ii.IdItemInstanciado
        INNER JOIN rib.Clasificacion c ON ii.IdClasificacion = c.IdClasificacion
        GROUP BY c.Descripcion, pl.IdClasificacion
    `);
    
    // Insertar en Supabase
    const { data, error } = await supabase
        .from('clasificaciones')
        .insert(
            clasificaciones.recordset.map(row => ({
                id: row.IdClasificacion,
                descripcion: row.Descripcion,
                cantidad: row.Cantidad
            }))
        );
    
    if (error) {
        console.error('❌ Error en migración:', error);
    } else {
        console.log('✅ Migración completada');
    }
}

migrateData();
```

---

## 🎨 Ajustes para Producción

### 1. Optimizaciones de Performance
```javascript
// next.config.js
module.exports = {
    experimental: {
        optimizeCss: true,
    },
    compress: true,
    poweredByHeader: false,
    generateEtags: false,
}
```

### 2. Variables de Entorno
```javascript
// lib/config.js
export const config = {
    isDev: process.env.NODE_ENV === 'development',
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    database: {
        url: process.env.DATABASE_URL
    }
}
```

### 3. Manejo de Errores Mejorado
```javascript
// lib/error-handler.js
export function handleAPIError(error, res) {
    console.error('API Error:', error);
    
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({ error: 'Error interno del servidor' });
    } else {
        res.status(500).json({ error: error.message });
    }
}
```

---

## 📊 Comparación de Costos

| Plataforma | Costo Inicial | Costo Mensual | Límites |
|------------|---------------|---------------|---------|
| **Vercel + Supabase** | $0 | $0 | 100GB bandwidth, 500MB DB |
| **Netlify + Supabase** | $0 | $0 | 100GB bandwidth, 500MB DB |
| **Railway** | $0 | $5 | 500GB bandwidth, 1GB RAM |
| **Vercel + PlanetScale** | $0 | $29 | 100GB bandwidth, 5GB DB |
| **DigitalOcean** | $0 | $6 | 1GB RAM, 25GB SSD, 1TB transfer |

---

## ✅ Checklist de Deployment

### Pre-Deploy
- [ ] Exportar datos de SQL Server
- [ ] Crear repositorio en GitHub
- [ ] Configurar variables de entorno
- [ ] Actualizar código para nueva BD
- [ ] Probar localmente con nueva BD

### Deploy
- [ ] Crear cuenta en plataforma elegida
- [ ] Configurar base de datos
- [ ] Migrar datos
- [ ] Conectar repositorio
- [ ] Configurar variables de entorno
- [ ] Hacer primer deploy

### Post-Deploy
- [ ] Verificar funcionalidad completa
- [ ] Probar web scraping
- [ ] Configurar dominio personalizado (opcional)
- [ ] Configurar analytics (opcional)
- [ ] Documentar URL y credenciales

---

## 🔗 URLs y Recursos

### Plataformas de Hosting
- [Vercel](https://vercel.com) - Frontend + Serverless
- [Netlify](https://netlify.com) - Frontend + Functions
- [Railway](https://railway.app) - Full-stack
- [DigitalOcean](https://digitalocean.com) - VPS

### Bases de Datos
- [Supabase](https://supabase.com) - PostgreSQL (GRATIS ✅)
- [PlanetScale](https://planetscale.com) - MySQL ($29/mes ❌)
- [MongoDB Atlas](https://mongodb.com/atlas) - NoSQL (Gratis limitado)
- [Neon](https://neon.tech) - PostgreSQL (Gratis alternativo)

### Herramientas
- [GitHub](https://github.com) - Control de versiones
- [Postman](https://postman.com) - Testing APIs

---

## 🎯 Recomendación Final

**Para tu caso específico, recomiendo la OPCIÓN 1 (Vercel + Supabase) porque:**

✅ **Gratis:** Sin costos iniciales ni mensuales  
✅ **Fácil:** Deploy automático desde GitHub  
✅ **PostgreSQL:** Base de datos más potente que MySQL  
✅ **Dashboard:** Interfaz gráfica para administrar datos  
✅ **API automática:** Genera REST y GraphQL automáticamente  
✅ **Real-time:** Funcionalidades en tiempo real incluidas  
✅ **Confiable:** Plataformas usadas por miles de apps  
✅ **Mantenimiento:** Casi cero mantenimiento requerido  

**Tiempo total estimado:** 2-3 horas para tener todo funcionando online.

### 🚨 Nota sobre PlanetScale:
PlanetScale eliminó su plan gratuito en abril 2024. Ahora cuesta $29/mes mínimo, por lo que **Supabase es la mejor alternativa gratuita** para PostgreSQL.

¿Quieres que empecemos con alguna de estas opciones? 