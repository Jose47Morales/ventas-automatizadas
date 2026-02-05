# HANDOVER – Sistema de Ventas Automatizadas por WhatsApp

Este documento tiene como objetivo facilitar la **entrega, continuidad y escalamiento** del proyecto a otros desarrolladores o equipos técnicos.

---

## 1. Descripción general del proyecto

Sistema de ventas automatizadas basado en WhatsApp, con un chatbot inteligente que gestiona:

* Venta por categorías
* Venta Mayor y Detal
* Pedidos con múltiples productos
* Venta por domicilio
* Estados del pedido
* Asignación de conductor para entregas

La arquitectura está diseñada para ser **modular, escalable y desacoplada**.

---

## 2. Arquitectura general

**Flujo principal:**

WhatsApp → n8n → Backend (Node.js / Express) → PostgreSQL

* **WhatsApp**: Canal de entrada y salida de mensajes.
* **n8n**: Orquestador del flujo conversacional y lógica del chatbot.
* **Backend**: Fuente de verdad (pedidos, productos, pagos, domicilios).
* **Base de datos**: Persistencia de estados y entidades.

---

## 3. Componentes del sistema

### 3.1 Backend (Node.js + Express)

Ubicación:

```
/backend
```

Responsabilidades:

* Gestión de productos
* Creación y actualización de pedidos
* Manejo de estados del pedido
* Almacenamiento de direcciones de entrega

Punto de entrada:

```
server.cjs
```

### 3.2 n8n (Chatbot y flujos)

Ubicación:

```
/n8n
```

Responsabilidades:

* Clasificación de intención del usuario
* Manejo de estados conversacionales
* Validaciones de entrada
* Comunicación con el backend
* Construcción de mensajes de salida

El chatbot **no almacena lógica de negocio crítica**; solo orquesta.

### 3.3 Base de datos (PostgreSQL)

Entidades principales:

* products
* orders
* order_items
* conductors (si se implementa)
* whatsapp_logs

Scripts importantes:

* schema.sql
* seeds.sql

---

## 4. Estados conversacionales del chatbot

Los estados se manejan desde `session.state`:

* `idle`
* `awaiting.product`
* `awaiting.selection`
* `awaiting.quantity`
* `awaiting.delivery_address`
* `awaiting.delivery_confirmation`
* `awaiting.payment`
* `awaiting.payment_confirmation`

**Regla importante:**
No saltar estados manualmente sin validar datos previos.

---

## 5. Flujo de venta por domicilio

1. Usuario selecciona productos
2. Se crea la orden (estado: pending)
3. Se solicita dirección de entrega
4. Usuario confirma dirección
5. Se asigna conductor
6. Se notifica estado del pedido
7. Pedido pasa a `in_dispatch`
8. Pedido finaliza en `delivered`

---

## 6. Endpoints críticos del backend

* `POST /api/orders` → Crear orden
* `PATCH /api/orders/:id/delivery-address` → Guardar dirección
* `PATCH /api/orders/:id/payment-status` → Actualizar pago
* `GET /api/orders/:id` → Obtener estado del pedido

**No duplicar lógica de validación en n8n y backend.**
El backend siempre valida datos críticos.

---

## 7. Variables de entorno

```
PORT=4000
DATABASE_URL=
WHATSAPP_TOKEN=
WEBHOOK_SECRET=
FRONTEND_URL=
```

Nunca subir valores reales al repositorio.

---

## 8. Convenciones importantes

* Estados y constantes se manejan como strings explícitos
* No usar lógica implícita basada en texto libre
* Cada cambio en flujos debe reflejarse en documentación
* Preferir PATCH sobre PUT para actualizaciones parciales

---

## 9. Qué está listo (MVP)

* Chatbot funcional
* Gestión de productos
* Creación de pedidos
* Venta Mayor / Detal
* Venta por domicilio (base)
* Integración backend ↔ n8n

---

## 10. Qué NO está listo o requiere validación

* Gestión de conductores
* Manejo de devoluciones
* Multi-sucursal

---

## 11. Próximos pasos recomendados

1. Unificar flujos repetidos en n8n
2. Implementar roles (admin / operador)
3. Métricas de conversión
4. Logs estructurados

---

## 12. Advertencias técnicas

* No modificar estados sin revisar n8n y backend
* No eliminar seeds sin respaldo
* Revisar CORS al cambiar dominios
* Webhooks deben validar firma
