/* USER */
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_role ON "user"("roleSlug");
CREATE INDEX idx_user_compromised ON "user"(compromised);

/* AUTH REFRESH TOKENS */
CREATE INDEX idx_refresh_user ON auth_refresh_tokens(user_id);
CREATE INDEX idx_refresh_token ON auth_refresh_tokens(token);
CREATE INDEX idx_refresh_fingerprint ON auth_refresh_tokens(fingerprint_hash);
CREATE INDEX idx_refresh_ip ON auth_refresh_tokens(ip_address);

/* PRODUCTS */
CREATE INDEX idx_products_nombre ON products(nombre);
CREATE INDEX idx_products_codigo_barras ON products(codigo_barras);
CREATE INDEX idx_products_categoria ON products(categoria);
CREATE INDEX idx_products_marca ON products(marca);

/* ORDERS */
CREATE INDEX idx_orders_client_phone ON orders(client_phone);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

/* ORDER ITEMS */
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

/* PAYMENTS */
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_gateway ON payments(gateway);

/* WHATSAPP LOGS */
CREATE INDEX idx_whatsapp_logs_type ON whatsapp_logs(log_type);
CREATE INDEX idx_whatsapp_logs_from ON whatsapp_logs(from_number);
CREATE INDEX idx_whatsapp_logs_created_at ON whatsapp_logs(created_at);

/* ANALYTICS */
CREATE INDEX idx_analytics_metric_type ON analytics(metric_type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);