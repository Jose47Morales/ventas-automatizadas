# **Proyecto: Ventas Automatizadas**
### **Versión inicial:** Octubre 2025
### **Equipo de desarrollo:** 3 personas

---

## **1. Descripción general del proyecto**

Ventas Automatizadas es una plataforma inteligente que integra inteligencia artificial, automatización de procesos y gestión de inventario en tiempo real para ofrecer ventas completamente autónomas a través de WhatsApp y web.

El sistema permite atender clientes 24/7 sin personal humano, mostrando productos, procesando pagos, actualizando el inventario y generando métricas de rendimiento comercial en tiempo real.

## **2. Objetivo general**

Diseñar e implementar una solución integral que automatice el proceso de venta —desde la consulta del cliente hasta el pago confirmado— utilizando IA y flujos inteligentes de n8n, optimizando tiempo, eficiencia y satisfacción del cliente.

## **3. Alcance funcional**
**Incluye:**

- Asistente virtual (IA) integrado a WhatsApp Cloud API mediante n8n.

- Gestión completa de productos, pedidos y stock desde una API REST.

- Integración de pasarela de pagos (PayU / Stripe / MercadoPago).

- Panel administrativo web con métricas de ventas, stock y comportamiento del bot.

- Analítica en tiempo real de conversiones, ingresos y rendimiento del chatbot.

- Despliegue completo en la nube (Docker + Render / Railway / Vercel).

**No incluye:**

- Descuentos ni precios diferenciados para mayoristas.

- Multiusuario o CRM avanzado (versión inicial enfocada en automatización de venta).

- Aplicación móvil nativa (la interfaz es web y WhatsApp).

## **4. Arquitectura técnica**

| Componente |	Tecnología / Herramienta |	Función principal |
|-----------|----------------------------|--------------------|
| Frontend  | (UI + Dashboard)	React + Vite + Tailwind + Recharts |	Landing y panel administrativo |
| Backend API	| Node.js (Express)	     | Lógica del negocio, endpoints y conexión a BD |
| Base de datos	| PostgreSQL | Gestión de productos, pedidos y stock |
| Chatbot / Automatización |	n8n + WhatsApp Cloud API + IA (Claude Haiku / GPT-4-mini) |	Interacción automática con clientes |
| Pagos	| Stripe / PayU / MercadoPago |	Procesamiento seguro y verificación automática |
| Infraestructura	| Docker + Render / Railway / Vercel |	Contenedores y despliegue en la nube |
| Autenticación	| JWT + bcrypt |	Acceso seguro al panel administrativo |

## **5. Flujo general del sistema**

1. Cliente inicia conversación (WhatsApp o web).

2. El asistente virtual (IA) interpreta la intención y muestra el catálogo.

3. El cliente selecciona producto y cantidad.

4. El bot genera un pedido y envía link de pago.

5. Al confirmarse el pago, el backend actualiza stock y registra la venta.

6. El cliente recibe confirmación automática.

7. El panel administrativo muestra las métricas y ventas en tiempo real.

## **6. Roles y responsabilidades**
| Rol |	Integrante |	Responsabilidades |
|-----|------------|--------------------|
| Líder Técnico + Backend Developer |	Jose Morales |	Arquitectura del sistema, desarrollo del backend, integración con n8n, configuración de IA y despliegue. |
| Frontend Developer |	Juan Lozano |	Desarrollo del panel administrativo, landing page, dashboard de métricas y conexión con la API. |
| Project Manager (Gestor del Proyecto) |	Gerardo Martínez |	Planificación, seguimiento del cronograma, control de calidad, gestión del tablero Trello y documentación de avances. |

## **7. Cronograma de desarrollo (8 semanas)**

| Semana |	Objetivo |	Responsable(s) |	Entregables |
|--------|-----------|-----------------|--------------|
| 1 |	Configuración del entorno, Docker, DB y conexión WhatsApp Cloud API |	Jose Morales |	Entorno funcional, repositorio y estructura base. |
| 2	| Chatbot básico con IA (flujo conversacional) |	Jose Morales |	Bot activo en WhatsApp con IA funcional. |
| 3	| Backend API CRUD de productos y pedidos |	Jose Morales |	Endpoints REST y base de datos conectada. |
| 4 |	Frontend inicial (Landing + Login admin) |	Juan Lozano |	Interfaz conectada con backend. |
| 5	| Integración de pagos automáticos |	Jose Morales |	Flujo de pago completo y stock actualizado. |
| 6 |	Panel de métricas y analítica |	Juan Lozano |	Dashboard con datos en tiempo real. |
| 7	| Pruebas, QA y corrección de errores |	Todo el equipo |	Sistema estable y documentado. |
| 8	| Despliegue y documentación final |	Jose Morales + Gerardo Martínez |	Sistema en producción + guía técnica. |

## **8. Organización y gestión**
### **Herramientas utilizadas:**
| Categoría |	Herramienta |	Uso |
|-----------|-------------|-----|
| Gestión de proyecto |	Trello |	Control de tareas, sprints y entregas |
| Control de versiones |	GitHub |	Código fuente y documentación |
| Comunicación |	WhatsApp / Google Meet |	Reuniones y coordinación semanal |
| Documentación |	Google Docs / Notion |	Registro de avances y decisiones |
| Diseño UI |	Figma |	Prototipos visuales y estructura de panel |
| Automatización |	n8n |	Flujos conversacionales y conexión con APIs |
| Despliegue |	Render / Railway / Vercel |	Entornos productivos |

## **9. Metodología de trabajo**

- Se trabajará bajo un enfoque ágil semanal (Sprints de 1 semana).

- Cada lunes se asignan tareas → cada viernes se revisan avances.

- El Project Manager mantiene actualizado el tablero Trello.

- Toda la comunicación técnica se centraliza en Trello y GitHub.

- La definición de “listo” para cada tarea incluye:

> Código probado, documentado y revisado por otro integrante.

## **10. Fases futuras (Post-MVP)**

Una vez lanzada la primera versión (MVP), se proyectan las siguientes mejoras:

- Facturación electrónica integrada.

- Sistema de usuarios y perfiles (clientes frecuentes).

- Implementación de recomendaciones de producto basadas en IA.

- Integración con canales adicionales (Instagram / Web Chat).

## **11. Entregable final esperado**

Una plataforma totalmente automatizada de ventas con:

- Chatbot inteligente funcional.

- Base de datos sincronizada y gestionada por API.

- Flujo completo de compra con pagos verificados.

Panel administrativo operativo en producción.

Documentación técnica y de usuario entregada.
