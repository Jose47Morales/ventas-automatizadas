ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_product_id_fkey;

DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    referencia VARCHAR(100),
    codigo_barras VARCHAR(50),
    invima VARCHAR(50),
    cum VARCHAR(50),
    codigo_producto_dian VARCHAR(50),
    existencias INTEGER DEFAULT 0,
    impuesto NUMERIC(16,8) DEFAULT 0,
    precioVenta_con_impuesto NUMERIC(16,8),
    precio_venta_base NUMERIC(16,8),
    precio_venta_minimo NUMERIC(16,8),
    descuento_maximo_ps NUMERIC(16,8),
    precio_compra NUMERIC(16,8),
    precio_compraIpm NUMERIC(16,8),
    total_impoconsumo NUMERIC(16,8),
    total_estampilla NUMERIC(16,8),
    ICUI NUMERIC(16, 8),
    IBUA NUMERIC(16,8),
    costo NUMERIC(16,8),
    stock_minimo INTEGER DEFAULT 0,
    es_ingrediente BOOLEAN DEFAULT FALSE,
    manejo_bascula BOOLEAN DEFAULT FALSE,
    vender_solo_existencia INTEGER DEFAULT 1,
    realizar_pedido_solo_existencia INTEGER DEFAULT 1,
    utilidad NUMERIC(5,2),
    mostrar_tienda BOOLEAN DEFAULT TRUE,
    categoria VARCHAR(100),
    marca VARCHAR(100),
    codigo_cuenta VARCHAR(50),
    precio1 NUMERIC(10,2),
    precio2 NUMERIC(10,2),
    precio3 NUMERIC(10,2),
    precio4 NUMERIC(10,2),
    ubicacion VARCHAR(255),
    proveedor VARCHAR(255),
    nit_proveedor VARCHAR(50),
    url_imagen VARCHAR(500),
    nota TEXT,
    tipo_producto VARCHAR(50),
    imagenes JSONB DEFAULT '[]'::JSONB,
    videos JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE orders
ADD CONSTRAINT orders_product_id_fkey
FOREIGN KEY (product_id) REFERENCES products(id_producto);