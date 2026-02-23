# Informe Ejecutivo: Dashboard de Prevención de Riesgo

## Resumen

**Dashboard de Prevención de Riesgo** es una plataforma de gestión y análisis de accidentes e incidentes laborales que centraliza datos, visualiza patrones y genera alertas automáticas para apoyar la toma de decisiones en seguridad ocupacional.

**Repositorio:** https://github.com/German-Faymex/Dashboard-Prevencion-Riesgo
**Deploy:** Railway (Docker)

---

## 1. Necesidad que Resuelve

Las áreas de prevención de riesgos en empresas industriales enfrentan múltiples desafíos:

- **Datos fragmentados**: la información de incidentes está dispersa en planillas Excel sin conexión
- **Falta de visibilidad en tiempo real**: no existe una vista consolidada del estado de seguridad
- **Dificultad para identificar patrones**: qué partes del cuerpo se lesionan más, qué centros de trabajo son más riesgosos, qué clasificaciones predominan
- **Imposibilidad de cuantificar impacto financiero**: los costos de atención, medicamentos y días perdidos no se analizan de forma integrada
- **Reacción en vez de prevención**: sin alertas automáticas, los equipos reaccionan tarde a tendencias peligrosas

---

## 2. Cómo se Abordó

### Stack Tecnológico
| Componente | Tecnología |
|---|---|
| Backend | FastAPI 0.115 + Python (async) |
| Frontend | React 19 + TypeScript + Vite 6 + Tailwind CSS v4 |
| Base de Datos | SQLAlchemy 2 (async) + PostgreSQL (prod) / SQLite (dev) |
| Visualización | Recharts 2.15 (gráficos interactivos) |
| Excel | openpyxl (lectura) + xlsxwriter (exportación) |
| Íconos | Lucide React |
| Deploy | Docker multi-stage + Railway |

### Arquitectura
- **SPA full-stack**: React frontend + FastAPI backend en un solo contenedor Docker
- **Base de datos async**: operaciones no bloqueantes con asyncpg/aiosqlite
- **Parser Excel inteligente**: soporta 35+ variaciones de nombres de columna en español
- **CORS habilitado** para desarrollo y producción

---

## 3. Cómo Funciona

### Flujo de Datos

```
Archivo Excel (.xlsx/.xls)
         ↓
┌────────────────────────────────┐
│   PARSER DE EXCEL INTELIGENTE  │
├── Normalización de headers     │
│   (35+ variaciones en español) │
├── Parseo de fechas (4 formatos)│
├── Validación de campos         │
├── Defaults automáticos         │
└────────────────────────────────┘
         ↓
┌────────────────────────────────┐
│   BASE DE DATOS                │
├── Registro de carga            │
├── Registros de incidentes      │
└── PostgreSQL / SQLite          │
└────────────────────────────────┘
         ↓
┌────────────────────────────────┐
│   DASHBOARD INTERACTIVO        │
├── 6 KPIs principales           │
├── 8 visualizaciones            │
├── Mapa corporal interactivo    │
├── Panel de tendencias/alertas  │
├── Tabla de incidentes          │
└── Exportación a Excel          │
└────────────────────────────────┘
```

### Módulos Principales

#### KPIs (6 tarjetas)
- Total de incidentes (con tendencia mes a mes)
- Total de accidentes
- Días perdidos (impacto productivo)
- Costo total (impacto financiero)
- Casos activos (en proceso)
- Edad promedio de afectados

#### Visualizaciones (8 gráficos)
1. **Gráfico de torta**: distribución Incidentes vs. Accidentes
2. **Barras horizontales**: incidentes por clasificador
3. **Barras verticales**: incidentes por centro de trabajo
4. **Gráfico de área**: tendencia mensual (incidentes + accidentes en el tiempo)
5. **Barras verticales**: costo por clasificador (impacto financiero por tipo)
6. **Gráfico de torta**: distribución por tipo de atención
7. **Barras**: distribución por sexo y cargo
8. Todos los gráficos son interactivos (tooltips, formato personalizado)

#### Mapa Corporal Interactivo (SVG)
- **33 regiones del cuerpo** clickeables (cabeza, cuello, hombros, brazos, torso, abdomen, caderas, piernas, pies)
- **Código de colores**: Verde (1), Amarillo (2), Naranja (3), Rojo (4+) incidentes
- **Efectos de brillo** al pasar el mouse
- **Panel de detalle** al hacer click: región, cantidad, porcentaje, lista de incidentes con fecha y clasificador
- **Normalización inteligente** de nombres de partes del cuerpo en español

#### Panel de Tendencias y Alertas
- Cambio % mes a mes de incidentes (con indicador de dirección)
- Tendencia de costos (%)
- Parte del cuerpo más afectada
- Tipo de clasificador más común
- **Alertas automáticas**:
  - ⚠️ Advertencia: aumento >20% de incidentes vs. mes anterior
  - ⚠️ Advertencia: parte del cuerpo con >3 incidentes
  - 🔴 Crítica: aumento de costos >50% vs. mes anterior
  - ℹ️ Info: >5 casos activos pendientes de resolución

#### Tabla de Incidentes
- Lista completa paginada (20 por página)
- Búsqueda: nombre, RUT, observaciones (case-insensitive)
- Ordenamiento por 12 campos
- Filtrado en tiempo real sin recarga

### Sistema de Filtros Multi-Dimensional
Todos los endpoints soportan filtros combinados:
- **Rango de fechas**: desde/hasta
- **Organización**: centro de trabajo, cargo
- **Tipo**: incidente vs. accidente, clasificador
- **Impacto**: parte del cuerpo, estado final
- **Búsqueda**: texto libre en nombre, RUT, observaciones

### Gestión de Datos
- **Carga de archivos Excel** con validación automática
- **Listado de cargas** con timestamp y conteo de registros
- **Eliminación de cargas** (cascada a todos los incidentes asociados)
- **Exportación a Excel** con 23 columnas formateadas profesionalmente

---

## 4. Beneficios

### Para Equipos de Prevención
- **Visibilidad en tiempo real**: monitorear incidentes conforme se reportan
- **Reconocimiento de patrones**: identificar qué partes del cuerpo se lesionan más frecuentemente
- **Detección de tendencias**: detectar aumentos mensuales y picos de costos inmediatamente
- **Intervenciones focalizadas**: concentrar esfuerzos de prevención en áreas/actividades de alto riesgo

### Para Gerencia
- **Seguimiento de impacto financiero**: cuantificar costo de incidentes (directo + indirecto por tiempo perdido)
- **Monitoreo de KPIs**: métricas clave de seguridad mes a mes
- **Decisiones basadas en datos**: planificación de seguridad y asignación de recursos con evidencia
- **Cumplimiento regulatorio**: documentación centralizada de incidentes para auditorías laborales

### Para Operaciones
- **Datos centralizados**: fuente única de verdad reemplazando planillas dispersas
- **Alertas automáticas**: problemas críticos de seguridad destacados automáticamente
- **Entrada de datos simple**: carga de Excel con validación
- **Reportería flexible**: exportar cualquier subconjunto de datos

### Métricas de Valor
| Antes | Después |
|---|---|
| Datos en múltiples Excel sin conexión | Base de datos centralizada con dashboard |
| Análisis manual de tendencias | Detección automática de patrones y alertas |
| Sin visibilidad de costos integrados | KPIs financieros en tiempo real |
| Reportes estáticos | Gráficos interactivos con filtros dinámicos |
| Sin mapa de lesiones | Mapa corporal interactivo con 33 regiones |

---

## 5. Características Técnicas Destacadas

- **Diseño responsivo**: mobile a desktop
- **Tema oscuro**: interfaz moderna, reduce fatiga visual
- **Operaciones async**: sin bloqueo de I/O en la base de datos
- **Parser robusto**: soporta variaciones de tildes, mayúsculas, abreviaciones en español
- **Docker multi-stage**: imagen optimizada para producción
- **Health check**: endpoint `/api/health` para monitoreo
- **TypeScript + Python type hints**: código type-safe en ambos lados
