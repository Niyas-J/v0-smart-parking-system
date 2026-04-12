-- Premium parking: zones, optional alert imagery, 60+ structured slots (run once on Neon/Postgres)

ALTER TABLE slots ADD COLUMN IF NOT EXISTS zone VARCHAR(20) DEFAULT 'car';
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS image_url TEXT;

INSERT INTO slots (slot_number, floor, slot_type, status, hourly_rate, zone)
SELECT v.slot_number, v.floor, 'standard'::varchar, 'available'::varchar, v.rate::numeric, v.zone::varchar
FROM (
  VALUES
    ('BK-01', 1, 0.75, 'bike'), ('BK-02', 1, 0.75, 'bike'), ('BK-03', 1, 0.75, 'bike'), ('BK-04', 1, 0.75, 'bike'), ('BK-05', 1, 0.75, 'bike'),
    ('BK-06', 1, 0.75, 'bike'), ('BK-07', 1, 0.75, 'bike'), ('BK-08', 1, 0.75, 'bike'), ('BK-09', 1, 0.75, 'bike'), ('BK-10', 1, 0.75, 'bike'),
    ('BK-11', 1, 0.75, 'bike'), ('BK-12', 1, 0.75, 'bike'), ('BK-13', 1, 0.75, 'bike'), ('BK-14', 1, 0.75, 'bike'), ('BK-15', 1, 0.75, 'bike'),
    ('BK-16', 1, 0.75, 'bike'), ('BK-17', 1, 0.75, 'bike'), ('BK-18', 1, 0.75, 'bike'), ('BK-19', 1, 0.75, 'bike'), ('BK-20', 1, 0.75, 'bike'),
    ('CR-01', 2, 2.00, 'car'), ('CR-02', 2, 2.00, 'car'), ('CR-03', 2, 2.00, 'car'), ('CR-04', 2, 2.00, 'car'), ('CR-05', 2, 2.00, 'car'),
    ('CR-06', 2, 2.00, 'car'), ('CR-07', 2, 2.00, 'car'), ('CR-08', 2, 2.00, 'car'), ('CR-09', 2, 2.00, 'car'), ('CR-10', 2, 2.00, 'car'),
    ('CR-11', 2, 2.00, 'car'), ('CR-12', 2, 2.00, 'car'), ('CR-13', 2, 2.00, 'car'), ('CR-14', 2, 2.00, 'car'), ('CR-15', 2, 2.00, 'car'),
    ('CR-16', 2, 2.00, 'car'), ('CR-17', 2, 2.00, 'car'), ('CR-18', 2, 2.00, 'car'), ('CR-19', 2, 2.00, 'car'), ('CR-20', 2, 2.00, 'car'),
    ('SV-01', 3, 3.50, 'suv'), ('SV-02', 3, 3.50, 'suv'), ('SV-03', 3, 3.50, 'suv'), ('SV-04', 3, 3.50, 'suv'), ('SV-05', 3, 3.50, 'suv'),
    ('SV-06', 3, 3.50, 'suv'), ('SV-07', 3, 3.50, 'suv'), ('SV-08', 3, 3.50, 'suv'), ('SV-09', 3, 3.50, 'suv'), ('SV-10', 3, 3.50, 'suv'),
    ('SV-11', 3, 3.50, 'suv'), ('SV-12', 3, 3.50, 'suv'), ('SV-13', 3, 3.50, 'suv'), ('SV-14', 3, 3.50, 'suv'), ('SV-15', 3, 3.50, 'suv'),
    ('SV-16', 3, 3.50, 'suv'), ('SV-17', 3, 3.50, 'suv'), ('SV-18', 3, 3.50, 'suv'), ('SV-19', 3, 3.50, 'suv'), ('SV-20', 3, 3.50, 'suv')
) AS v(slot_number, floor, rate, zone)
ON CONFLICT (slot_number) DO NOTHING;
