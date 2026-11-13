-- Planes SaaS iniciales para ENCUESTSOFT (PostgreSQL / Neon)
INSERT INTO plans (
  code, name, description, price, billing_cycle,
  max_forms, max_submissions_per_month, max_storage_mb, max_users,
  allow_webhooks, allow_integrations, allow_custom_branding, is_active
)
VALUES
  ('free', 'Gratis', 'Ideal para probar la plataforma', 0, 'free', 3, 200, 100, 1, FALSE, FALSE, FALSE, TRUE),
  ('starter', 'Starter', 'Para pequeños equipos y negocios', 15, 'monthly', 15, 2000, 1024, 3, TRUE, TRUE, FALSE, TRUE),
  ('pro', 'Profesional', 'Formularios ilimitados y reportes avanzados', 49, 'monthly', 100, 20000, 10240, 10, TRUE, TRUE, TRUE, TRUE),
  ('enterprise', 'Empresarial', 'Paquete a medida con soporte prioritario', 149, 'monthly', 1000, 200000, 102400, 50, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  billing_cycle = EXCLUDED.billing_cycle,
  max_forms = EXCLUDED.max_forms,
  max_submissions_per_month = EXCLUDED.max_submissions_per_month,
  max_storage_mb = EXCLUDED.max_storage_mb,
  max_users = EXCLUDED.max_users,
  allow_webhooks = EXCLUDED.allow_webhooks,
  allow_integrations = EXCLUDED.allow_integrations,
  allow_custom_branding = EXCLUDED.allow_custom_branding,
  is_active = EXCLUDED.is_active;
