-- Planes SaaS iniciales para ENCUESTSOFT
USE encuestsoft;

INSERT INTO plans (code, name, description, price, billing_cycle, max_forms, max_submissions_per_month, max_storage_mb, max_users, allow_webhooks, allow_integrations, allow_custom_branding)
VALUES
('free', 'Gratis', 'Ideal para probar la plataforma', 0, 'free', 3, 200, 100, 1, FALSE, FALSE, FALSE),
('starter', 'Starter', 'Para pequeños equipos y negocios', 15, 'monthly', 15, 2000, 1024, 3, TRUE, TRUE, FALSE),
('pro', 'Profesional', 'Formularios ilimitados y reportes avanzados', 49, 'monthly', 100, 20000, 10240, 10, TRUE, TRUE, TRUE),
('enterprise', 'Empresarial', 'Paquete a medida con soporte prioritario', 149, 'monthly', 1000, 200000, 102400, 50, TRUE, TRUE, TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);
