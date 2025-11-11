CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    category VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(100),
    client_phone VARCHAR(20),
    product_id INT REFERENCES products(id),
    quantity INT DEFAULT 1,
    total NUMERIC(10, 2),
    payment_status VARCHAR(20) DEFAULT 'pending',
    date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    gateway VARCHAR(50),
    confirmation_code VARCHAR(100),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50),
    value NUMERIC(10, 2),
    date TIMESTAMP DEFAULT NOW()
);