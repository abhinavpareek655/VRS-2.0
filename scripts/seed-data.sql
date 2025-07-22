-- Insert vehicle categories
INSERT INTO public.vehicle_categories (name, description, icon) VALUES
('Luxury Sedans', 'Premium comfort for executive travel', '🚗'),
('SUVs & Crossovers', 'Spacious rides for family adventures', '🚙'),
('Sports Cars', 'High-performance driving experience', '🏎️'),
('Motorcycles', 'Freedom on two wheels', '🏍️'),
('Hatchbacks', 'Compact and efficient city cars', '🚘'),
('Convertibles', 'Open-air driving experience', '🏎️');

-- Insert sample vehicles (prices are per hour)
INSERT INTO public.vehicles (category_id, name, brand, model, year, type, price_per_day, fuel_type, transmission, seats, features, images, location) VALUES
-- Luxury Sedans (₹6-7/hour = ₹150-160/day)
((SELECT id FROM public.vehicle_categories WHERE name = 'Luxury Sedans'), 'BMW 5 Series', 'BMW', '5 Series', 2023, 'car', 6.25, 'Petrol', 'Automatic', 5, ARRAY['Leather Seats', 'Sunroof', 'GPS Navigation', 'Bluetooth'], ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'], 'Mumbai'),
((SELECT id FROM public.vehicle_categories WHERE name = 'Luxury Sedans'), 'Mercedes C-Class', 'Mercedes-Benz', 'C-Class', 2023, 'car', 6.67, 'Petrol', 'Automatic', 5, ARRAY['Premium Audio', 'Climate Control', 'Leather Interior'], ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'], 'Delhi'),
((SELECT id FROM public.vehicle_categories WHERE name = 'Luxury Sedans'), 'Audi A4', 'Audi', 'A4', 2022, 'car', 5.83, 'Petrol', 'Automatic', 5, ARRAY['Virtual Cockpit', 'Quattro AWD', 'Premium Sound'], ARRAY['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'], 'Bangalore'),

-- SUVs & Crossovers (₹4-5/hour = ₹100-120/day)
((SELECT id FROM public.vehicle_categories WHERE name = 'SUVs & Crossovers'), 'Toyota Fortuner', 'Toyota', 'Fortuner', 2023, 'car', 5.00, 'Diesel', 'Automatic', 7, ARRAY['4WD', 'Third Row Seating', 'Roof Rails'], ARRAY['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'], 'Mumbai'),
((SELECT id FROM public.vehicle_categories WHERE name = 'SUVs & Crossovers'), 'Mahindra XUV700', 'Mahindra', 'XUV700', 2023, 'car', 4.17, 'Petrol', 'Automatic', 7, ARRAY['Panoramic Sunroof', 'ADAS', 'Premium Audio'], ARRAY['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'], 'Pune'),

-- Sports Cars (₹7.5-8.3/hour = ₹180-200/day)
((SELECT id FROM public.vehicle_categories WHERE name = 'Sports Cars'), 'BMW Z4', 'BMW', 'Z4', 2023, 'car', 8.33, 'Petrol', 'Automatic', 2, ARRAY['Convertible', 'Sport Mode', 'Premium Audio'], ARRAY['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'], 'Mumbai'),
((SELECT id FROM public.vehicle_categories WHERE name = 'Sports Cars'), 'Audi TT', 'Audi', 'TT', 2022, 'car', 7.50, 'Petrol', 'Manual', 2, ARRAY['Sport Suspension', 'Bose Audio', 'LED Headlights'], ARRAY['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'], 'Delhi'),

-- Motorcycles (₹1-1.25/hour = ₹25-30/day)
((SELECT id FROM public.vehicle_categories WHERE name = 'Motorcycles'), 'Royal Enfield Classic 350', 'Royal Enfield', 'Classic 350', 2023, 'bike', 1.04, 'Petrol', 'Manual', 2, ARRAY['Retro Design', 'Single Cylinder Engine', 'Comfortable Seating'], ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], 'Mumbai'),
((SELECT id FROM public.vehicle_categories WHERE name = 'Motorcycles'), 'KTM Duke 390', 'KTM', 'Duke 390', 2023, 'bike', 1.25, 'Petrol', 'Manual', 2, ARRAY['Digital Display', 'ABS', 'LED Lighting'], ARRAY['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800'], 'Bangalore'),
((SELECT id FROM public.vehicle_categories WHERE name = 'Motorcycles'), 'Honda CB350RS', 'Honda', 'CB350RS', 2023, 'bike', 1.17, 'Petrol', 'Manual', 2, ARRAY['Retro-Modern Design', 'Assist & Slipper Clutch', 'LED Headlight'], ARRAY['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800'], 'Chennai'),

-- Hatchbacks (₹1.7-1.9/hour = ₹40-45/day)
((SELECT id FROM public.vehicle_categories WHERE name = 'Hatchbacks'), 'Maruti Swift', 'Maruti Suzuki', 'Swift', 2023, 'car', 1.67, 'Petrol', 'Manual', 5, ARRAY['Fuel Efficient', 'Compact Size', 'Easy Parking'], ARRAY['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'], 'Mumbai'),
((SELECT id FROM public.vehicle_categories WHERE name = 'Hatchbacks'), 'Hyundai i20', 'Hyundai', 'i20', 2023, 'car', 1.88, 'Petrol', 'Automatic', 5, ARRAY['Touchscreen Infotainment', 'Wireless Charging', 'Sunroof'], ARRAY['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'], 'Delhi');
