DROP TABLE IF EXISTS tmp_products;
CREATE TEMP TABLE tmp_products (
    id_producto text,
    nombre text,
    referencia text,
    codigo_barras text,
    invima text,
    cum text,
    codigo_producto_dian text,
    existencias text,
    impuesto text,
    precioVenta_con_impuesto text,
    precio_venta_base text,
    precio_venta_minimo text,
    descuento_maximo_ps text,
    precio_compra text,
    precio_compraIpm text,
    total_impoconsumo text,
    total_estampilla text,
    ICUI text,
    IBUA text,
    costo text,
    stock_minimo text,
    es_ingrediente text,
    manejo_bascula text,
    vender_solo_existencia text,
    realizar_pedido_solo_existencia text,
    utilidad text,
    mostrar_tienda text,
    categoria text,
    marca text,
    codigo_cuenta text,
    precio1 text,
    precio2 text,
    precio3 text,
    precio4 text,
    ubicacion text,
    proveedor text,
    nit_proveedor text,
    url_imagen text,
    nota text,
    tipo_producto text
);

\copy tmp_products(id_producto, nombre, referencia, codigo_barras, invima, cum, codigo_producto_dian, existencias, impuesto, precioVenta_con_impuesto, precio_venta_base, precio_venta_minimo, descuento_maximo_ps, precio_compra, precio_compraIpm, total_impoconsumo, total_estampilla, ICUI, IBUA, costo, stock_minimo, es_ingrediente, manejo_bascula, vender_solo_existencia, realizar_pedido_solo_existencia, utilidad, mostrar_tienda, categoria, marca, codigo_cuenta, precio1, precio2, precio3, precio4, ubicacion, proveedor, nit_proveedor, url_imagen, nota, tipo_producto)
FROM 'backend/src/database/exportar_productos.csv' DELIMITER ';' CSV HEADER NULL '';

INSERT INTO products (
    id_producto, nombre, referencia, codigo_barras, invima, cum, codigo_producto_dian,
    existencias, impuesto, precioVenta_con_impuesto, precio_venta_base, precio_venta_minimo,
    descuento_maximo_ps, precio_compra, precio_compraIpm, total_impoconsumo, total_estampilla,
    ICUI, IBUA, costo, stock_minimo, es_ingrediente, manejo_bascula, vender_solo_existencia,
    realizar_pedido_solo_existencia, utilidad, mostrar_tienda, categoria, marca, codigo_cuenta,
    precio1, precio2, precio3, precio4, ubicacion, proveedor, nit_proveedor, url_imagen, nota,
    tipo_producto
)
SELECT
    id_producto::integer,
    nombre,
    referencia,
    codigo_barras,
    invima,
    cum,
    codigo_producto_dian,
    NULLIF(existencias,'')::integer,
    NULLIF(impuesto,'')::numeric,
    NULLIF(precioVenta_con_impuesto,'')::numeric,
    NULLIF(precio_venta_base,'')::numeric,
    NULLIF(precio_venta_minimo,'')::numeric,
    NULLIF(descuento_maximo_ps,'')::numeric,
    NULLIF(precio_compra,'')::numeric,
    NULLIF(precio_compraIpm,'')::numeric,
    NULLIF(total_impoconsumo,'')::numeric,
    NULLIF(total_estampilla,'')::numeric,
    NULLIF(ICUI,'')::numeric,
    NULLIF(IBUA,'')::numeric,
    NULLIF(costo,'')::numeric,
    NULLIF(stock_minimo,'')::integer,
    CASE WHEN es_ingrediente IN ('x','1','yes','true') THEN true ELSE false END,
    CASE WHEN manejo_bascula IN ('x','1','yes','true') THEN true ELSE false END,
    CASE WHEN vender_solo_existencia IN ('2') THEN false
         WHEN vender_solo_existencia IN ('3','1') THEN true
         ELSE false
    END,
    CASE WHEN realizar_pedido_solo_existencia IN ('2') THEN false
         WHEN realizar_pedido_solo_existencia IN ('3','1') THEN true
         ELSE false
    END,
    CASE 
        WHEN utilidad ~ '^[+-]?([0-9]*[.])?[0-9]+$' THEN utilidad::NUMERIC
        ELSE 0
    END,
    CASE WHEN mostrar_tienda IN ('x','1','yes','true') THEN true ELSE false END,
    categoria,
    marca,
    codigo_cuenta,
    NULLIF(precio1,'')::numeric,
    NULLIF(precio2,'')::numeric,
    NULLIF(precio3,'')::numeric,
    NULLIF(precio4,'')::numeric,
    ubicacion,
    proveedor,
    nit_proveedor,
    url_imagen,
    nota,
    tipo_producto
FROM tmp_products;