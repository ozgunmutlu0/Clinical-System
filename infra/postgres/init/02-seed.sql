INSERT INTO users (id, name, email, password, phone, role, enabled)
VALUES
    (1, 'Admin User', 'admin@clinic.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+905550000001', 'ADMIN', TRUE),
    (2, 'Dr. Selin Demir', 'doctor@clinic.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+905550000002', 'DOCTOR', TRUE),
    (3, 'Ayse Yilmaz', 'patient@clinic.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+905550000003', 'PATIENT', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO doctors (id, user_id, name, specialty, working_hours, availability_rules, active)
VALUES
    (1, 2, 'Dr. Selin Demir', 'Neurology', 'Mon-Thu 10:00 - 18:00', '45-minute slots, lunch blocked 13:00-14:00', TRUE),
    (2, NULL, 'Dr. Elif Yilmaz', 'Cardiology', 'Mon-Fri 09:00 - 17:00', '30-minute slots, no bookings after 16:30', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO availability_slots (doctor_id, date, time, is_booked)
VALUES
    (1, CURRENT_DATE + 1, '10:00', FALSE),
    (1, CURRENT_DATE + 1, '11:00', FALSE),
    (2, CURRENT_DATE + 2, '09:30', FALSE),
    (2, CURRENT_DATE + 2, '10:00', FALSE)
ON CONFLICT DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('doctors_id_seq', (SELECT MAX(id) FROM doctors));
