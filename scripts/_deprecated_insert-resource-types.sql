INSERT INTO resource_types (type)
VALUES ('agents'),
  ('categories'),
  ('events'),
  ('eventSeries'),
  ('features'),
  ('lifts'),
  ('mediaObjects'),
  ('mountainAreas'),
  ('skiSlopes'),
  ('snowparks'),
  ('vennues')
RETURNING *;