/*
  # Seed Data for Products Table
  
  This file contains sample product data to populate the products table
  for demonstration and testing purposes.
*/

-- Insert sample products if they don't already exist
INSERT INTO products (name, description, price, image_url, stock)
SELECT 
  'Premium Wireless Headphones',
  'Experience crystal-clear audio with our premium wireless headphones. Features noise cancellation and 30-hour battery life.',
  129.99,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  50
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Premium Wireless Headphones'
);

INSERT INTO products (name, description, price, image_url, stock)
SELECT 
  'Smart Fitness Watch',
  'Track your fitness goals with our advanced smart watch. Features heart rate monitoring, sleep tracking, and workout analysis.',
  89.99,
  'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  75
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Smart Fitness Watch'
);

INSERT INTO products (name, description, price, image_url, stock)
SELECT 
  'Portable Bluetooth Speaker',
  'Take your music anywhere with our waterproof portable speaker. Features 24-hour battery life and powerful bass.',
  59.99,
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  100
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Portable Bluetooth Speaker'
);

INSERT INTO products (name, description, price, image_url, stock)
SELECT 
  'Ergonomic Office Chair',
  'Work in comfort with our ergonomically designed office chair. Features adjustable height, lumbar support, and breathable mesh back.',
  199.99,
  'https://images.unsplash.com/photo-1505843490578-27713f6c3c3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  30
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Ergonomic Office Chair'
);

INSERT INTO products (name, description, price, image_url, stock)
SELECT 
  'Professional Camera Drone',
  'Capture stunning aerial footage with our 4K camera drone. Features 30-minute flight time, obstacle avoidance, and follow-me mode.',
  799.99,
  'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  15
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Professional Camera Drone'
);

INSERT INTO products (name, description, price, image_url, stock)
SELECT 
  'Premium Coffee Maker',
  'Brew the perfect cup every time with our programmable coffee maker. Features adjustable strength, built-in grinder, and thermal carafe.',
  149.99,
  'https://images.unsplash.com/photo-1516315720917-231ef9f480d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  40
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Premium Coffee Maker'
);

INSERT INTO products (name, description, price, image_url, stock)
SELECT 
  'Mechanical Gaming Keyboard',
  'Dominate your competition with our responsive mechanical keyboard. Features RGB lighting, programmable keys, and anti-ghosting technology.',
  129.99,
  'https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  60
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Mechanical Gaming Keyboard'
);

INSERT INTO products (name, description, price, image_url, stock)
SELECT 
  'Wireless Charging Pad',
  'Eliminate cable clutter with our fast-charging wireless pad. Compatible with all Qi-enabled devices.',
  29.99,
  'https://images.unsplash.com/photo-1608045339897-ca5d5a7ac8e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  120
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Wireless Charging Pad'
);