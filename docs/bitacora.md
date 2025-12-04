# 📝 **Bitácora de Pruebas – Flujo de WhatsApp con IA (n8n)**
**📅 Fecha de la prueba**:
23 de noviembre de 2025

**👤 Usuario que realizó la prueba**:
José Morales

## 🧪 Objetivo de la prueba

Validar el flujo completo del sistema automatizado de WhatsApp con IA, desde la recepción del mensaje del usuario hasta la clasificación, respuesta inteligente, registro en base de datos y entrega correcta al API de WhatsApp Cloud.

## 🔄 Flujo evaluado

La prueba incluyó los siguientes pasos del flujo diseñado en n8n:

**1. Webhook de recepción**

* Recibe mensaje enviado desde WhatsApp Cloud API.
* Extrae `from`, `text`, `type`, `messageId`.

**2. Nodo de Validación**

* Verifica si el mensaje es válido.
* Solo mensajes válidos siguen el flujo.

**3. Clasificación con IA**

* Código que determina intención según palabras clave (saludo, compra, soporte, etc.).

**4. Switch por intención**

* Ruteo a 5 posibles intenciones.
* Cada rama tiene un Set que compone el mensaje de respuesta.
* **Rama especial**: *Realizar compra*
  * Envío de información a API backend (`/orders`).
  * Manejo de errores si DB falla.

**5. Merge de respuestas**

* Une todas las posibles respuestas en un solo flujo.

**6. Preparación del payload para WhatsApp**

* Nodo code que construye el JSON final para el API oficial.

**7. Envió del mensaje mediante WhatsApp API**

* HTTP Request hacia Graph API (Meta).

**8. Logs almacenados en BD**

* Logs de:
  * Mensaje entrante
  * Clasificación
  * Mensajes salientes
* Guardados en tabla `whatsapp_logs`.

## 💬 Conversación utilizada en la prueba

Usuario:
```ngix
Hola
```

Flujo detectó:

* Intent: saludo
*Input válido: ✔

Respuesta generada por la IA:
```cpp
¡Hola! 👋

¡Qué gusto saludarte!
Soy tu asistente virtual y estoy aquí para ayudarte 😊.
¿En qué puedo ayudarte hoy?

💼 Ver productos y servicios  
🛒 Realizar una compra  
🔧 Soporte técnico  
👤 Hablar con un agente humano  

Solo escribe lo que necesitas.
```

API de WhatsApp devolvió:
```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "573015006570",
      "wa_id": "573015006570"
    }
  ],
  "messages": [
    {
      "id": "wamid.HBgMNTczMDE1MDA2NTcwFQIAERgSOD..."
    }
  ]
}
```

## 🗃️ Logs generados (guardados en PostgreSQL)
### 📥 Log 1 – Incoming

* log_type: incoming
* from_number: 573015006570
* user_message: "Hola"
* message_id: extraído correctamente
* raw_data: JSON completo de Meta

### 🤖 Log 2 – Classification

* log_type: classification
* intent: saludo
* status: classified
* raw_data: objeto serializado correctamente en JSONB

### 📤 Log 3 – Outgoing

* log_type: outgoing
* to_number: 573015006570
* ai_response: mensaje renderizado por IA
* message_id: ID generado por Meta
* status: sent
* raw_data: respuesta completa del API de WhatsApp

## ✔️ Resultado final

La prueba fue exitosa. Todo el flujo funciona correctamente:

* Se recibe mensaje ➜ OK
* Se clasifica ➜ OK
* Se responde ➜ OK
* Se envían mensajes via Graph API ➜ OK
* Se registran logs entrantes, clasificación y salientes ➜ OK
* La base de datos almacena emojis y mensajes sin errores ➜ OK

---

**📅 Fecha de la prueba**:
04 de diciembre de 2025

**👤 Usuario que realizó la prueba**:
José Morales

A continuación se documentan las nuevas pruebas realizadas hoy, incluyendo capturas y resultados.

## 📷 1. Captura del flujo funcionando (Webhook -> IA -> Respuesta)

<img width="982" height="841" alt="image" src="https://github.com/user-attachments/assets/861ebc02-1c61-467a-8ad5-30fda49ecc2d" />

## 🧪 Prueba: Intent "compra" con llamada al backend

Entrada del usuario
```nginx
cargador
```

Clasificación IA
* Intent detectado: catalogo
* Pasa a la rama "Listar catálogo"

Request enviado al backend
```json
[
  {
    "searchTerm": "cargador",
    "clientName": "Jhosu",
    "clientPhone": "573015006570"
  }
]
```

Respuesta del backend
```json
[
  {
    "success": true,
    "products": [
      {
        "id_producto": 1884,
        "nombre": "ACCESORIO PARA CELULAR CARGADOR POWER BANK REF C40",
        "referencia": null,
        "codigo_barras": null,
        "invima": null,
        "cum": null,
        "codigo_producto_dian": null,
        "existencias": 5,
        "impuesto": "0.00000000",
        "precioventa_con_impuesto": "177167.00000000",
        "precio_venta_base": "177166.66670000",
        "precio_venta_minimo": "0.00000000",
        "descuento_maximo_ps": "0.00000000",
        "precio_compra": "166666.66670000",
        "precio_compraipm": "166666.66670000",
        "total_impoconsumo": "0.00000000",
        "total_estampilla": "0.00000000",
        "icui": "0.00000000",
        "ibua": "0.00000000",
        "costo": "166666.66670000",
        "stock_minimo": 5,
        "es_ingrediente": false,
        "manejo_bascula": false,
        "utilidad": "5.92662277",
        "mostrar_tienda": true,
        "categoria": "CACHARROS",
        "marca": "GENERICA",
        "codigo_cuenta": null,
        "precio1": "0.00000000",
        "precio2": "0.00000000",
        "precio3": "0.00000000",
        "precio4": "0.00000000",
        "ubicacion": null,
        "proveedor": "BODEGA EY",
        "nit_proveedor": null,
        "url_imagen": null,
        "nota": null,
        "tipo_producto": "Estandar",
        "imagenes": [],
        "videos": [],
        "created_at": "2025-11-24T01:30:31.025Z",
        "realizar_pedido_solo_existencia": true,
        "vender_solo_existencia": false
      },
      {
        "id_producto": 2515,
        "nombre": "BASE CARGADOR DUALSENSE PS5 ORIGINAL",
        "referencia": null,
        "codigo_barras": null,
        "invima": null,
        "cum": null,
        "codigo_producto_dian": null,
        "existencias": 2,
        "impuesto": "0.00000000",
        "precioventa_con_impuesto": "82796.00000000",
        "precio_venta_base": "82795.69892000",
        "precio_venta_minimo": "0.00000000",
        "descuento_maximo_ps": "100.00000000",
        "precio_compra": "77000.00000000",
        "precio_compraipm": "77000.00000000",
        "total_impoconsumo": "0.00000000",
        "total_estampilla": "0.00000000",
        "icui": "0.00000000",
        "ibua": "0.00000000",
        "costo": "77000.00000000",
        "stock_minimo": 5,
        "es_ingrediente": false,
        "manejo_bascula": false,
        "utilidad": "7.00000000",
        "mostrar_tienda": true,
        "categoria": "CACHARROS",
        "marca": "GENERICA",
        "codigo_cuenta": null,
        "precio1": "0.00000000",
        "precio2": "0.00000000",
        "precio3": "0.00000000",
        "precio4": "0.00000000",
        "ubicacion": null,
        "proveedor": "A.H.",
        "nit_proveedor": "75544",
        "url_imagen": null,
        "nota": null,
        "tipo_producto": "Estandar",
        "imagenes": [],
        "videos": [],
        "created_at": "2025-11-24T01:30:31.025Z",
        "realizar_pedido_solo_existencia": true,
        "vender_solo_existencia": false
      },
      {
        "id_producto": 14,
        "nombre": "CABEZA CARGADOR DE SAMSUNG 25W",
        "referencia": null,
        "codigo_barras": null,
        "invima": null,
        "cum": null,
        "codigo_producto_dian": null,
        "existencias": 1802,
        "impuesto": "0.00000000",
        "precioventa_con_impuesto": "7786.00000000",
        "precio_venta_base": "7786.45833300",
        "precio_venta_minimo": "0.00000000",
        "descuento_maximo_ps": "0.00000000",
        "precio_compra": "7700.00000000",
        "precio_compraipm": "7700.00000000",
        "total_impoconsumo": "0.00000000",
        "total_estampilla": "0.00000000",
        "icui": "0.00000000",
        "ibua": "0.00000000",
        "costo": "7700.00000000",
        "stock_minimo": 5,
        "es_ingrediente": false,
        "manejo_bascula": false,
        "utilidad": "1.11036789",
        "mostrar_tienda": true,
        "categoria": "ACCESORIOS",
        "marca": "GENERICA",
        "codigo_cuenta": null,
        "precio1": "16173.61111000",
        "precio2": "0.00000000",
        "precio3": "0.00000000",
        "precio4": "0.00000000",
        "ubicacion": null,
        "proveedor": "GOLD",
        "nit_proveedor": "67778",
        "url_imagen": null,
        "nota": null,
        "tipo_producto": "Estandar",
        "imagenes": [],
        "videos": [],
        "created_at": "2025-11-24T01:30:31.025Z",
        "realizar_pedido_solo_existencia": true,
        "vender_solo_existencia": false
      },
      {
        "id_producto": 15,
        "nombre": "CABEZA CARGADOR IPHONE 20W",
        "referencia": null,
        "codigo_barras": null,
        "invima": null,
        "cum": null,
        "codigo_producto_dian": null,
        "existencias": 1382,
        "impuesto": "0.00000000",
        "precioventa_con_impuesto": "8385.00000000",
        "precio_venta_base": "8385.41666700",
        "precio_venta_minimo": "0.00000000",
        "descuento_maximo_ps": "0.00000000",
        "precio_compra": "6600.00000000",
        "precio_compraipm": "6600.00000000",
        "total_impoconsumo": "0.00000000",
        "total_estampilla": "0.00000000",
        "icui": "0.00000000",
        "ibua": "0.00000000",
        "costo": "6600.00000000",
        "stock_minimo": 5,
        "es_ingrediente": false,
        "manejo_bascula": false,
        "utilidad": "21.29192547",
        "mostrar_tienda": true,
        "categoria": "ACCESORIOS",
        "marca": "GENERICA",
        "codigo_cuenta": null,
        "precio1": "16763.88889000",
        "precio2": "0.00000000",
        "precio3": "0.00000000",
        "precio4": "0.00000000",
        "ubicacion": null,
        "proveedor": "JOMILUX",
        "nit_proveedor": "34545",
        "url_imagen": null,
        "nota": null,
        "tipo_producto": "Estandar",
        "imagenes": [],
        "videos": [],
        "created_at": "2025-11-24T01:30:31.025Z",
        "realizar_pedido_solo_existencia": true,
        "vender_solo_existencia": false
      },
      {
        "id_producto": 16,
        "nombre": "CABEZA CARGADOR IPHONE 20W ORIGINAL",
        "referencia": null,
        "codigo_barras": null,
        "invima": null,
        "cum": null,
        "codigo_producto_dian": null,
        "existencias": 1879,
        "impuesto": "0.00000000",
        "precioventa_con_impuesto": "31146.00000000",
        "precio_venta_base": "31145.83333000",
        "precio_venta_minimo": "0.00000000",
        "descuento_maximo_ps": "0.00000000",
        "precio_compra": "29700.00000000",
        "precio_compraipm": "29700.00000000",
        "total_impoconsumo": "0.00000000",
        "total_estampilla": "0.00000000",
        "icui": "0.00000000",
        "ibua": "0.00000000",
        "costo": "29700.00000000",
        "stock_minimo": 5,
        "es_ingrediente": false,
        "manejo_bascula": false,
        "utilidad": "4.64214047",
        "mostrar_tienda": true,
        "categoria": "ACCESORIOS",
        "marca": "GENERICA",
        "codigo_cuenta": null,
        "precio1": "39194.44444000",
        "precio2": "0.00000000",
        "precio3": "0.00000000",
        "precio4": "0.00000000",
        "ubicacion": null,
        "proveedor": "ARM",
        "nit_proveedor": "7655",
        "url_imagen": null,
        "nota": null,
        "tipo_producto": "Estandar",
        "imagenes": [],
        "videos": [],
        "created_at": "2025-11-24T01:30:31.025Z",
        "realizar_pedido_solo_existencia": true,
        "vender_solo_existencia": false
      },
      {
        "id_producto": 1917,
        "nombre": "CABEZA CARGADOR IPHONE 20W TC",
        "referencia": null,
        "codigo_barras": null,
        "invima": null,
        "cum": null,
        "codigo_producto_dian": null,
        "existencias": 200,
        "impuesto": "0.00000000",
        "precioventa_con_impuesto": "7323.00000000",
        "precio_venta_base": "7322.88888900",
        "precio_venta_minimo": "0.00000000",
        "descuento_maximo_ps": "0.00000000",
        "precio_compra": "6888.88888900",
        "precio_compraipm": "6888.88888900",
        "total_impoconsumo": "0.00000000",
        "total_estampilla": "0.00000000",
        "icui": "0.00000000",
        "ibua": "0.00000000",
        "costo": "6888.88888900",
        "stock_minimo": 5,
        "es_ingrediente": false,
        "manejo_bascula": false,
        "utilidad": "5.92662277",
        "mostrar_tienda": true,
        "categoria": "ACCESORIOS",
        "marca": "GENERICA",
        "codigo_cuenta": null,
        "precio1": "0.00000000",
        "precio2": "0.00000000",
        "precio3": "0.00000000",
        "precio4": "0.00000000",
        "ubicacion": null,
        "proveedor": "FM IMPORTACIONES",
        "nit_proveedor": null,
        "url_imagen": null,
        "nota": null,
        "tipo_producto": "Estandar",
        "imagenes": [],
        "videos": [],
        "created_at": "2025-11-24T01:30:31.025Z",
        "realizar_pedido_solo_existencia": true,
        "vender_solo_existencia": false
      },
      {
        "id_producto": 2587,
        "nombre": "CABEZA CARGADOR SAMSUMG TRIO 200W",
        "referencia": null,
        "codigo_barras": null,
        "invima": null,
        "cum": null,
        "codigo_producto_dian": null,
        "existencias": 50,
        "impuesto": "0.00000000",
        "precioventa_con_impuesto": "21290.00000000",
        "precio_venta_base": "21290.32258000",
        "precio_venta_minimo": "0.00000000",
        "descuento_maximo_ps": "100.00000000",
        "precio_compra": "19800.00000000",
        "precio_compraipm": "19800.00000000",
        "total_impoconsumo": "0.00000000",
        "total_estampilla": "0.00000000",
        "icui": "0.00000000",
        "ibua": "0.00000000",
        "costo": "19800.00000000",
        "stock_minimo": 5,
        "es_ingrediente": false,
        "manejo_bascula": false,
        "utilidad": "7.00000000",
        "mostrar_tienda": true,
        "categoria": "ACCESORIOS",
        "marca": "GENERICA",
        "codigo_cuenta": null,
        "precio1": "0.00000000",
        "precio2": "0.00000000",
        "precio3": "0.00000000",
        "precio4": "0.00000000",
        "ubicacion": null,
        "proveedor": "EL IMPERIO ACCESORIOS",
        "nit_proveedor": "7900",
        "url_imagen": null,
        "nota": null,
        "tipo_producto": "Estandar",
        "imagenes": [],
        "videos": [],
        "created_at": "2025-11-24T01:30:31.025Z",
        "realizar_pedido_solo_existencia": true,
        "vender_solo_existencia": false
      },
      {
        "id_producto": 2452,
        "nombre": "CABEZA CARGADOR TECNO 50W",
        "referencia": null,
        "codigo_barras": null,
        "invima": null,
        "cum": null,
        "codigo_producto_dian": null,
        "existencias": 50,
        "impuesto": "0.00000000",
        "precioventa_con_impuesto": "10054.00000000",
        "precio_venta_base": "10053.76344000",
        "precio_venta_minimo": "0.00000000",
        "descuento_maximo_ps": "100.00000000",
        "precio_compra": "9350.00000000",
        "precio_compraipm": "9350.00000000",
        "total_impoconsumo": "0.00000000",
        "total_estampilla": "0.00000000",
        "icui": "0.00000000",
        "ibua": "0.00000000",
        "costo": "9350.00000000",
        "stock_minimo": 5,
        "es_ingrediente": false,
        "manejo_bascula": false,
        "utilidad": "7.00000000",
        "mostrar_tienda": true,
        "categoria": "ACCESORIOS",
        "marca": "GENERICA",
        "codigo_cuenta": null,
        "precio1": "0.00000000",
        "precio2": "0.00000000",
        "precio3": "0.00000000",
        "precio4": "0.00000000",
        "ubicacion": null,
        "proveedor": "WOLF",
        "nit_proveedor": "66677",
        "url_imagen": null,
        "nota": null,
        "tipo_producto": "Estandar",
        "imagenes": [],
        "videos": [],
        "created_at": "2025-11-24T01:30:31.025Z",
        "realizar_pedido_solo_existencia": true,
        "vender_solo_existencia": false
      },
      {
        "id_producto": 2084,
        "nombre": "CABEZA DE CARGADOR IP 20W",
        "referencia": null,
        "codigo_barras": null,
        "invima": null,
        "cum": null,
        "codigo_producto_dian": null,
        "existencias": 300,
        "impuesto": "0.00000000",
        "precioventa_con_impuesto": "11237.00000000",
        "precio_venta_base": "11236.55914000",
        "precio_venta_minimo": "0.00000000",
        "descuento_maximo_ps": null,
        "precio_compra": "8800.00000000",
        "precio_compraipm": "8800.00000000",
        "total_impoconsumo": "0.00000000",
        "total_estampilla": "0.00000000",
        "icui": "0.00000000",
        "ibua": "0.00000000",
        "costo": "8800.00000000",
        "stock_minimo": 5,
        "es_ingrediente": false,
        "manejo_bascula": false,
        "utilidad": "21.68421053",
        "mostrar_tienda": true,
        "categoria": "ACCESORIOS",
        "marca": "GENERICA",
        "codigo_cuenta": null,
        "precio1": "9448.88888900",
        "precio2": "0.00000000",
        "precio3": "0.00000000",
        "precio4": "0.00000000",
        "ubicacion": null,
        "proveedor": "KINOTEC MEDELLIN",
        "nit_proveedor": null,
        "url_imagen": null,
        "nota": null,
        "tipo_producto": "Estandar",
        "imagenes": [],
        "videos": [],
        "created_at": "2025-11-24T01:30:31.025Z",
        "realizar_pedido_solo_existencia": true,
        "vender_solo_existencia": false
      },
      {
        "id_producto": 2771,
        "nombre": "CABEZA DE CARGADOR YOFEL 33W TC",
        "referencia": null,
        "codigo_barras": null,
        "invima": null,
        "cum": null,
        "codigo_producto_dian": null,
        "existencias": 30,
        "impuesto": "0.00000000",
        "precioventa_con_impuesto": "14194.00000000",
        "precio_venta_base": "14193.54839000",
        "precio_venta_minimo": "0.00000000",
        "descuento_maximo_ps": "100.00000000",
        "precio_compra": "13200.00000000",
        "precio_compraipm": "13200.00000000",
        "total_impoconsumo": "0.00000000",
        "total_estampilla": "0.00000000",
        "icui": "0.00000000",
        "ibua": "0.00000000",
        "costo": "13200.00000000",
        "stock_minimo": 5,
        "es_ingrediente": false,
        "manejo_bascula": false,
        "utilidad": "7.00000000",
        "mostrar_tienda": true,
        "categoria": "ACCESORIOS",
        "marca": "GENERICA",
        "codigo_cuenta": null,
        "precio1": "0.00000000",
        "precio2": "0.00000000",
        "precio3": "0.00000000",
        "precio4": "0.00000000",
        "ubicacion": null,
        "proveedor": "YOFEL",
        "nit_proveedor": "7422",
        "url_imagen": null,
        "nota": null,
        "tipo_producto": "Estandar",
        "imagenes": [],
        "videos": [],
        "created_at": "2025-11-24T01:30:31.025Z",
        "realizar_pedido_solo_existencia": true,
        "vender_solo_existencia": false
      }
    ]
  }
]
```

Respuesta enviada al usuario por WhatsApp
<img width="389" height="653" alt="image" src="https://github.com/user-attachments/assets/0759cd87-a1b0-40fa-aa63-3f010e2451ff" />

## 🗃️ Logs generados

Log Incoming - Catálogo
```json
{
  "log_type": "incoming",
  "from": "5730XXXXXXXX",
  "message": "cargador"
}
```

Log Classification - Catálogo
```json
{
  "log_type": "classification",
  "intent": "listar_catalogo"
}
```

Log Outgoing - Catálogo
```json
{
  "log_type": "outgoing",
  "status": "sent"
}
```

## 🎯 Resultado final de las pruebas de hoy
* Clasificación "catalogo" -> OK
* Llamada al backend -> OK
* Respuesta al usuario -> OK
* Logs de los tres tipos -> OK
