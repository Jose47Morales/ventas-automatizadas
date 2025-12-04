# **Documentación Técnica del Proyecto - Ventas Automatizadas**
### **Versión:** Enero 2026
### **Equipo:** 3 integrantes (Backend - Frontend - PM)

## **1. Descripción general**

Ventas Automatizadas es una plataforma que integra IA, automatización con n8n y una API REST para gestionar productos, pedidos, pagos y analítica en tiempo real. El objetivo es permitir ventas autónomas a través de WhatsApp y Web.

## **2. Arquitectura del sistema**

| Capa | Tecnología | Función |
|------|------------|---------|
| Backend API | Node.js + Express | Enpoints REST, validación y lógica de negocio |
| Base de datos | PostgreSQL | Persistencia de productos, pedidos, pagos y métricas |
| Bot Automatizado | n8n + WhatsApp Cloud API + IA | Lógistica conversacional y automatización |
| Frontend | React + Vite | Dashboard administrativo |
| Despliegue | Docker + Render | Producción escalable |

## **3. Convenciones de la API**

* **Base URL**: `/api/`.
* **Formato**: JSON
* **Autenticación**: JWT (pendiente MVP)
* **Códigos comunes**:
  * `200` OK
  * `201` Recurso creado
  * `400` Error en la solicitud
  * `404` No encontrado
  * `500` Error interno

## **4. PRODUCTS API**

### GET /api/products
Obtiene todos los productos

*Respuesta 200*
```json
[
  {
    "id_producto": 1,
    "nombre": "Laptop Lenovo",
    "precioventa_con_impuesto": 2300000,
    "stock": 5
  }
]
```

### GET /api/products/:id
Obtiene un solo producto

*Respuesta 404*
```json
{ "success": false, "message": "Product not found" }
```

### POST /api/products
Crea un producto

*Body ejemplo*
```json
{
  "nombre": "iPhone 15",
  "precioventa_con_impuesto": "4500000",
  "stock_minimo": 10
}
```

*Respuesta 201*
```json
{ "id_producto": 7, "nombre": "iPhone 15", "stock_minimo": 10 }
```

### PUT /api/products/:id
Actualiza producto.

### DELETE /api/products/:id
Elimina producto.

## **5. ORDERS API**

### GET /api/orders
Obtiene todos los pedidos registrados.

### GET /api/orders/:id
Detalle de un pedido.

### POST /api/orders
Crea un pedido.

*Body ejemplo*
```json
{
  "client_name": "Luis Pérez",
  "product_id": 5,
  "quantity": 2
}
```

*Respuesta 201*
```json
{
  "id": 20,
  "status": "pending_payment"
}
```

### PUT /api/orders/:id
Actualiza un pedido.

### DELETE /api/orders/:id
Elimina un pedido.

## **6. PAYMENTS API**

### GET /api/payments
Obtiene todos los registros de pagos.

*Respuesta ejemplo*
```json
[
  {
    "id": 1,
    "order_id": 10,
    "gateway": "Stripe",
    "confirmation_code": "pi_82js72",
    "status": "approved"
  }
]
```

### GET /api/payments/:id
Obtiene un pago por ID

### POST /api/payments
Registra un nuevo pago.

*Body ejemplo*
```json
{
  "order_id": 10,
  "gateway": "Stripe",
  "confirmation_code": "pi_12345",
  "status": "approved"
}
```

*Respuesta 201*
```json
{
  "id": 33,
  "status": "approved"
}
```

### PUT /api/payments/:id
Actualiza información del pago.

### DELETE /api/payments/:id
Elimina un pago.

## **7. Integración con n8n**
Flujos actuales:
1. WhatsApp -> Webhook -> IA -> API Orders
2. Bot genera link de pago
3. Pasarela confirma -> API Payments
4. API actualiza stock y analítica
5. Bot notifica al cliente

Diagrama simplificado:
```markdown
Cliente → WhatsApp → n8n → IA  
                       ↓  
                 Backend API  
                 ↓           ↓
             PostgreSQL   Pasarela de pagos
```

## **8. Estructura del Backend**
```css
backend/
│── src/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── db/
│   ├── swagger/
│   ├── server.cjs
│
└── docs/
    └── readme.md
```

## **9. Swagger UI**
Disponible en:
```bash
GET /api-docs
```
Permite explorar la API Y probar endpoints

## **10. Buenas prácticas del proyecto**
* Commits semanales obligatorios
* Ramas por funcionalidad (`feature/_`)
* Pull requests con revisión
* Testing básico en controladores
* Logs centralizados
* Documentación actualizada por sprint

## **11. Próximos pasos del equipo**
* Implementar autenticación JWT
* Añadir estados avanzados de pedido
* Historico de inventario
* Dashboard versión 2.0
