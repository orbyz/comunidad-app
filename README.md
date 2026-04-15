COMUNIDAD APP:

# 📦 Módulo: Incidencias (Estado Actual)

## ✅ Funcionalidades Implementadas

### 1. Creación de Incidencias

* Creación desde modal
* Validación de campos (title, description)
* Asignación automática de `property_id`
* Control por rol (ADMIN / RESIDENTE)

### 2. Listado de Incidencias

* Renderizado en lista (LEFT panel)
* Selección de incidencia
* Multi-tenant (filtrado por propiedad)
* Residente solo ve sus incidencias

### 3. Detalle de Incidencia

* Visualización completa (RIGHT panel)
* Estado, prioridad, descripción
* Sincronización con backend

### 4. Timeline

* Comentarios + historial unificados
* Orden cronológico
* Sin duplicados
* Visual tipo chat
* Usuario visible (nombre/email)

### 5. Comentarios

* Crear comentario
* Persistencia en DB
* Realtime (Supabase)

### 6. Estados

* OPEN → IN_PROGRESS → RESOLVED
* Persistencia correcta
* Registro en history

### 7. Followers

* Unirse a incidencia
* Contador de afectados

### 8. Seguridad (Multi-tenant)

* Filtro por `property_id`
* Override backend (no confiar en frontend)
* Protección por roles

### 9. UX Básica

* Manejo de errores
* Fallbacks seguros
* UI consistente

---

## ⚠️ Funcionalidades NO Incluidas (Fase 2)

* Filtros avanzados
* Búsqueda
* Adjuntos (imagenes/documentos)
* Notificaciones
* SLA / tiempos de resolución
* Prioridad automática
* Asignación automática de técnicos

---

## 🧠 Estado del Módulo

✔ Funcional
✔ Estable
✔ Escalable

👉 **Módulo listo para producción básica**

---

# 🚀 Siguiente Módulo: Finanzas / Pagos

## 🎯 Objetivo

Gestionar:

* Deudas
* Pagos
* Balance por propiedad
* Validación de pagos

---

## 🧱 Lo que YA existe (según proyecto)

* Tabla `payments`
* Tabla `debts`
* API básica de pagos
* Dashboard financiero inicial

---

## ⚠️ Problema actual

Actualmente el módulo está:

* Parcialmente implementado
* No estructurado
* Mezcla lógica de negocio + UI

👉 Necesitamos **reorganizar antes de continuar**

---

# 🧭 PLAN CORRECTO (FASE 1 - ORGANIZACIÓN)

## 1. Estructura de carpetas

```
lib/modules/finance/
  ├── finance.types.ts
  ├── finance.repository.ts
  ├── finance.service.ts
```

---

## 2. Separación clara

### Repository

* Acceso a DB

### Service

* Lógica de negocio

### API

* Validación + control de acceso

---

## 3. Entidades clave

### Payments

* id
* property_id
* amount
* method
* status (PENDING / VERIFIED / REJECTED)

### Debts

* id
* property_id
* amount
* due_date
* status

---

## 4. Casos de uso iniciales

### ADMIN

* Ver pagos
* Ver deudas
* Verificar pago
* Rechazar pago

### RESIDENTE

* Ver balance
* Ver deudas
* Registrar pago

---


---

**Continuara.**
