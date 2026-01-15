CREATE EXTENSION IF NOT EXISTS "pgcrypto";

/* =====================
   USER
===================== */
CREATE TABLE IF NOT EXISTS "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,

    "firstName" TEXT,
    "lastName" TEXT,

    "roleSlug" TEXT NOT NULL DEFAULT 'global:member',

    disabled BOOLEAN NOT NULL DEFAULT false,

    compromised BOOLEAN NOT NULL DEFAULT false,
    compromised_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/* =====================
   AUTH REFRESH TOKENS
===================== */
CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    token TEXT NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,

    user_agent TEXT,
    ip_address INET,
    device_name TEXT,

    fingerprint_hash TEXT NOT NULL,

    CONSTRAINT fk_refresh_user
        FOREIGN KEY (user_id)
        REFERENCES "user"(id)
        ON DELETE CASCADE
);

/* =====================
   PRODUCTS
===================== */
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nombre TEXT NOT NULL,
    referencia TEXT,
    codigo_barras TEXT,
    invima TEXT,
    cum TEXT,
    codigo_producto_dian TEXT,

    existencias INTEGER NOT NULL DEFAULT 0,
    impuesto NUMERIC(16,8) NOT NULL DEFAULT 0,

    precioventa_con_impuesto NUMERIC(16,8),
    precio_venta_base NUMERIC(16,8),
    precio_venta_minimo NUMERIC(16,8),
    descuento_maximo_ps NUMERIC(16,8),

    precio_compra NUMERIC(16,8),
    precio_compraipm NUMERIC(16,8),

    total_impoconsumo NUMERIC(16,8),
    total_estampilla NUMERIC(16,8),

    icui NUMERIC(16,8),
    ibua NUMERIC(16,8),

    costo NUMERIC(16,8),
    stock_minimo INTEGER NOT NULL DEFAULT 0,

    es_ingrediente BOOLEAN NOT NULL DEFAULT false,
    manejo_bascula BOOLEAN NOT NULL DEFAULT false,

    utilidad NUMERIC(11,5),
    mostrar_tienda BOOLEAN NOT NULL DEFAULT true,

    categoria TEXT,
    marca TEXT,
    codigo_cuenta TEXT,

    precio1 NUMERIC(10,2),
    precio2 NUMERIC(10,2),
    precio3 NUMERIC(10,2),
    precio4 NUMERIC(10,2),

    ubicacion TEXT,
    proveedor TEXT,
    nit_proveedor TEXT,

    url_imagen TEXT,
    nota TEXT,
    tipo_producto TEXT,

    imagenes JSONB NOT NULL DEFAULT '[]',
    videos JSONB NOT NULL DEFAULT '[]',

    realizar_pedido_solo_existencia BOOLEAN NOT NULL DEFAULT true,
    vender_solo_existencia BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/* =====================
   ORDERS
===================== */
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    client_name TEXT,
    client_phone TEXT NOT NULL,

    payment_status TEXT NOT NULL DEFAULT 'pending',
    order_status TEXT NOT NULL DEFAULT 'created',

    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'whatsapp',
    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    delivery_address TEXT
);

/* =====================
   ORDER ITEMS
===================== */
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL,
    product_id UUID NOT NULL,

    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT
);

/* =====================
   PAYMENTS
===================== */
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL,
    gateway TEXT NOT NULL,
    status TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    payment_link TEXT,
    amount NUMERIC(14,2),

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
);

/* =====================
   CHAT SESSIONS
===================== */
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_phone TEXT NOT NULL UNIQUE,
    state TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/* =====================
   WHATSAPP LOGS
===================== */
CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    log_type TEXT NOT NULL,
    from_number TEXT,
    to_number TEXT,

    user_message TEXT,
    ai_response TEXT,
    intent TEXT,
    message_id TEXT,
    status TEXT,

    raw_data JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/* =====================
   ANALYTICS
===================== */
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    metric_type TEXT NOT NULL,
    value NUMERIC NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
