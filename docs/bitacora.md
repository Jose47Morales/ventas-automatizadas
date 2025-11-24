📝 Bitácora de Pruebas – Flujo de WhatsApp con IA (n8n)
📅 Fecha de la prueba

23 de noviembre de 2025

👤 Usuario que realizó la prueba

José Morales

🧪 Objetivo de la prueba

Validar el flujo completo del sistema automatizado de WhatsApp con IA, desde la recepción del mensaje del usuario hasta la clasificación, respuesta inteligente, registro en base de datos y entrega correcta al API de WhatsApp Cloud.

🔄 Flujo evaluado

La prueba incluyó los siguientes pasos del flujo diseñado en n8n:

Webhook de recepción

Recibe mensaje enviado desde WhatsApp Cloud API.

Extrae from, text, type, messageId.

Nodo de Validación

Verifica si el mensaje es válido.

Solo mensajes válidos siguen el flujo.

Clasificación con IA

Código que determina intención según palabras clave (saludo, compra, soporte, etc.).

Switch por intención

Ruteo a 5 posibles intenciones.

Cada rama tiene un Set que compone el mensaje de respuesta.

Rama especial: Realizar compra

Envío de información a API backend (/orders).

Manejo de errores si DB falla.

Merge de respuestas

Une todas las posibles respuestas en un solo flujo.

Preparación del payload para WhatsApp

Nodo code que construye el JSON final para el API oficial.

Envió del mensaje mediante WhatsApp API

HTTP Request hacia Graph API (Meta).

Logs almacenados en BD

Logs de:

mensaje entrante

clasificación

mensajes salientes

Guardados en tabla whatsapp_logs.

💬 Conversación utilizada en la prueba

Usuario:

Hola


Flujo detectó:

Intent: saludo

Input válido: ✔

Respuesta generada por la IA:

¡Hola! 👋

¡Qué gusto saludarte!
Soy tu asistente virtual y estoy aquí para ayudarte 😊.
¿En qué puedo ayudarte hoy?

💼 Ver productos y servicios  
🛒 Realizar una compra  
🔧 Soporte técnico  
👤 Hablar con un agente humano  

Solo escribe lo que necesitas.


API de WhatsApp devolvió:

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

🗃️ Logs generados (guardados en PostgreSQL)
📥 Log 1 – Incoming

log_type: incoming

from_number: 573015006570

user_message: "Hola"

message_id: extraído correctamente

raw_data: JSON completo de Meta

🤖 Log 2 – Classification

log_type: classification

intent: saludo

status: classified

raw_data: objeto serializado correctamente en JSONB

📤 Log 3 – Outgoing

log_type: outgoing

to_number: 573015006570

ai_response: mensaje renderizado por IA

message_id: ID generado por Meta

status: sent

raw_data: respuesta completa del API de WhatsApp

✔️ Resultado final

La prueba fue exitosa.
Todo el flujo funciona correctamente:

Se recibe mensaje ➜ OK

Se clasifica ➜ OK

Se responde ➜ OK

Se envían mensajes via Graph API ➜ OK

Se registran logs entrantes, clasificación y salientes ➜ OK

La base de datos almacena emojis y mensajes sin errores ➜ OK