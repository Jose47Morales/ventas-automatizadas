const { pool } = require("../database/db.cjs");

module.exports = {
    getAllProducts: async () => {
        const result = await pool.query('SELECT * FROM products ORDER BY id_producto DESC');
        return result.rows;
    },

    getProductById: async (id) => {
        const result = await pool.query('SELECT * FROM products WHERE id_producto = $1', [id]);
        return result.rows[0];
    },

    searchProducts: async (search) => {
        // Normalizamos
        const term = '%${search.toLowerCase()}%';

        const result = await pool.query(
            `SELECT * FROM products
            WHERE 
                LOWER(nombre) LIKE LOWER($1) OR 
                LOWER(referencia) LIKE LOWER($1) OR
                LOWER(codigo_barras) LIKE LOWER($1) OR
                LOWER(categoria) LIKE LOWER($1) OR
                LOWER(marca) LIKE LOWER($1) OR
                CAST(id_producto AS TEXT) LIKE $1
            ORDER BY nombre ASC
            LIMIT 50;
        `, [term]
        );

        return result.rows;
    },

    createProduct: async (data) => {
        const { nombre, referencia, codgigo_barras, invima, cum, codigo_producto_dian,
            existencias, impuesto, precioventa_con_impuesto, precio_venta_base,
            precio_venta_minimo, descuento_maximo_ps, precio_compra, precio_compraipm,
            total_impoconsumo, total_estampilla, icui, ibua, costo, stock_minimo,
            es_ingrediente, manejo_bascula, utilidad, mostrar_tienda, categoria,
            marca, codigo_cuenta, precio1, precio2, precio3, precio4, ubicacion, proveedor,
            nit_proveedor, url_imagen, nota, tipo_producto, imagenes, videos, realizar_pedido_solo_existencia,
            vender_solo_existencia } = data;

        const insert = await pool.query(
            `INSERT INTO products 
            (nombre, referencia, codgigo_barras, invima, cum, codigo_producto_dian,
            existencias, impuesto, precioventa_con_impuesto, precio_venta_base, 
            precio_venta_minimo, descuento_maximo_ps, precio_compra, precio_compraipm,
            total_impoconsumo, total_estampilla, icui, ibua, costo, stock_minimo,
            es_ingrediente, manejo_bascula, utilidad, mostrar_tienda, categoria,
            marca, codigo_cuenta, precio1, precio2, precio3, precio4, ubicacion, proveedor,
            nit_proveedor, url_imagen, nota, tipo_producto, imagenes, videos, realizar_pedido_solo_existencia,
            vender_solo_existencia)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41)
            RETURNING *`,
            [
                nombre, referencia, codgigo_barras, invima, cum, codigo_producto_dian,
                existencias, impuesto, precioventa_con_impuesto, precio_venta_base,
                precio_venta_minimo, descuento_maximo_ps, precio_compra, precio_compraipm,
                total_impoconsumo, total_estampilla, icui, ibua, costo, stock_minimo,
                es_ingrediente, manejo_bascula, utilidad, mostrar_tienda, categoria,
                marca, codigo_cuenta, precio1, precio2, precio3, precio4, ubicacion, proveedor,
                nit_proveedor, url_imagen, nota, tipo_producto, imagenes, videos, realizar_pedido_solo_existencia,
                vender_solo_existencia
            ]
        );

        return insert.rows[0];
    },

    updateProduct: async (data) => {
        const { id_producto, nombre, referencia, codgigo_barras, invima, cum, codigo_producto_dian,
            existencias, impuesto, precioventa_con_impuesto, precio_venta_base,
            precio_venta_minimo, descuento_maximo_ps, precio_compra, precio_compraipm,
            total_impoconsumo, total_estampilla, icui, ibua, costo, stock_minimo,
            es_ingrediente, manejo_bascula, utilidad, mostrar_tienda, categoria,
            marca, codigo_cuenta, precio1, precio2, precio3, precio4, ubicacion, proveedor,
            nit_proveedor, url_imagen, nota, tipo_producto, imagenes, videos, realizar_pedido_solo_existencia,
            vender_solo_existencia } = data;

        const update = await pool.query(
            `UPDATE products SET 
                nombre = $1, referencia = $2, codgigo_barras = $3, invima = $4, cum = $5, codigo_producto_dian = $6,
                existencias = $7, impuesto = $8, precioventa_con_impuesto = $9, precio_venta_base = $10,
                precio_venta_minimo = $11, descuento_maximo_ps = $12, precio_compra = $13, precio_compraipm = $14,
                total_impoconsumo = $15, total_estampilla = $16, icui = $17, ibua = $18, costo = $19, stock_minimo = $20,
                es_ingrediente = $21, manejo_bascula = $22, utilidad = $23, mostrar_tienda = $24, categoria = $25,
                marca = $26, codigo_cuenta = $27, precio1 = $28, precio2 = $29, precio3 = $30, precio4 = $31, ubicacion = $32, proveedor = $33,
                nit_proveedor = $34, url_imagen = $35, nota = $36, tipo_producto = $37, imagenes = $38, videos = $39, realizar_pedido_solo_existencia = $40,
                vender_solo_existencia = $41
            WHERE id_producto = $42 RETURNING *`,
            [nombre, referencia, codgigo_barras, invima, cum, codigo_producto_dian,
            existencias, impuesto, precioventa_con_impuesto, precio_venta_base,
            precio_venta_minimo, descuento_maximo_ps, precio_compra, precio_compraipm,
            total_impoconsumo, total_estampilla, icui, ibua, costo, stock_minimo,
            es_ingrediente, manejo_bascula, utilidad, mostrar_tienda, categoria,
            marca, codigo_cuenta, precio1, precio2, precio3, precio4, ubicacion, proveedor,
            nit_proveedor, url_imagen, nota, tipo_producto, imagenes, videos, realizar_pedido_solo_existencia,
            vender_solo_existencia, id_producto]
        );
        return update.rows[0];
    },

    deleteProduct: async (id) => {
        const result = await pool.query('DELETE FROM products WHERE id_producto = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};