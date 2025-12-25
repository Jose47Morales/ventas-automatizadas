-- ============================
-- SEED: PRODUCTS
-- ============================

BEGIN;

TRUNCATE TABLE products RESTART IDENTITY CASCADE;

COPY products (
    nombre,
    referencia,
    codigo_barras,
    invima,
    cum,
    codigo_producto_dian,
    existencias,
    impuesto,
    precioventa_con_impuesto,
    precio_venta_base,
    precio_venta_minimo,
    descuento_maximo_ps,
    precio_compra,
    precio_compraipm,
    total_impoconsumo,
    total_estampilla,
    icui,
    ibua,
    costo,
    stock_minimo,
    es_ingrediente,
    manejo_bascula,
    utilidad,
    mostrar_tienda,
    categoria,
    marca,
    codigo_cuenta,
    precio1,
    precio2,
    precio3,
    precio4,
    ubicacion,
    proveedor,
    nit_proveedor,
    url_imagen,
    nota,
    tipo_producto,
    imagenes,
    videos,
    realizar_pedido_solo_existencia,
    vender_solo_existencia
)
FROM '/exportar_productos_utf8.csv'
WITH (
    FORMAT csv,
    HEADER true,
    DELIMITER ';',
    ENCODING 'UTF8'
);

COMMIT;
