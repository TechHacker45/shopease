/*
  Seed data for the e-commerce application
*/

-- Insert sample products
INSERT INTO products (name, description, price, image_url, stock)
VALUES
  ('Modern Desk Lamp', 'A sleek desk lamp with adjustable brightness perfect for any workspace.', 49.99, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 50),
  
  ('Wireless Headphones', 'Premium noise-cancelling headphones with 30-hour battery life.', 129.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 75),
  
  ('Smart Watch', 'Track your fitness, receive notifications, and more with this advanced smartwatch.', 199.99, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 30),
  
  ('Portable Bluetooth Speaker', 'Waterproof portable speaker with rich bass and 20-hour playtime.', 79.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 100),
  
  ('Coffee Maker', 'Programmable coffee maker with thermal carafe to keep your coffee hot for hours.', 89.99, 'https://images.unsplash.com/photo-1517668808822-9abb39f0db5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 40),
  
  ('Ergonomic Office Chair', 'Comfortable office chair with lumbar support and adjustable height.', 199.99, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 25),
  
  ('Leather Wallet', 'Genuine leather wallet with RFID blocking technology.', 45.99, 'https://images.unsplash.com/photo-1620758402299-7d51d9bfa74e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 150),
  
  ('Stainless Steel Water Bottle', 'Double-walled insulated bottle that keeps drinks cold for 24 hours or hot for 12 hours.', 34.99, 'https://images.unsplash.com/photo-1570189524004-4966ea98809a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 200);