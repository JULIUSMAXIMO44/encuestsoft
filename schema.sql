-- ============================================================
-- ENCUESTSOFT - Esquema de base de datos MySQL
-- Generador multipropósito de formularios/encuestas (drag & drop)
-- ============================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS encuestsoft CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE encuestsoft;

-- ---------- Planes SaaS ----------
CREATE TABLE IF NOT EXISTS plans (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  billing_cycle ENUM('free','monthly','yearly','one_time') DEFAULT 'free',
  max_forms INT DEFAULT 3,
  max_submissions_per_month INT DEFAULT 500,
  max_storage_mb INT DEFAULT 100,
  max_users INT DEFAULT 1,
  allow_webhooks BOOLEAN DEFAULT FALSE,
  allow_integrations BOOLEAN DEFAULT FALSE,
  allow_custom_branding BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- Organizaciones (tenants SaaS) ----------
CREATE TABLE IF NOT EXISTS organizations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  plan_id INT UNSIGNED NOT NULL,
  logo_url VARCHAR(500),
  primary_color VARCHAR(20) DEFAULT '#4F46E5',
  trial_ends_at DATETIME,
  subscription_status ENUM('trialing','active','past_due','canceled') DEFAULT 'trialing',
  submissions_used_this_month INT DEFAULT 0,
  storage_used_mb DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES plans(id)
) ENGINE=InnoDB;

-- ---------- Usuarios ----------
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL UNIQUE,
  organization_id INT UNSIGNED NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner','admin','editor','viewer') DEFAULT 'editor',
  avatar_url VARCHAR(500),
  a11y_high_contrast BOOLEAN DEFAULT FALSE,
  a11y_font_scale DECIMAL(3,2) DEFAULT 1.00,
  a11y_reduced_motion BOOLEAN DEFAULT FALSE,
  locale VARCHAR(10) DEFAULT 'es',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified_at DATETIME,
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- Formularios ----------
CREATE TABLE IF NOT EXISTS forms (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL UNIQUE,
  organization_id INT UNSIGNED NOT NULL,
  created_by INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  description TEXT,
  status ENUM('draft','published','archived','paused') DEFAULT 'draft',
  draft_schema_json JSON,
  is_password_protected BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255),
  style_json JSON,
  success_message TEXT,
  error_message TEXT,
  redirect_url VARCHAR(500),
  redirect_delay_seconds INT DEFAULT 0,
  recaptcha_enabled BOOLEAN DEFAULT FALSE,
  recaptcha_version ENUM('v2','v3') DEFAULT 'v2',
  notify_email_enabled BOOLEAN DEFAULT TRUE,
  notify_emails TEXT,
  autoresponder_enabled BOOLEAN DEFAULT FALSE,
  autoresponder_subject VARCHAR(255),
  autoresponder_body TEXT,
  autoresponder_field_key VARCHAR(100),
  reference_id_prefix VARCHAR(20) DEFAULT 'REF',
  reference_id_format VARCHAR(50) DEFAULT '{PREFIX}-{YEAR}-{SEQ}',
  allow_prefill_from_url BOOLEAN DEFAULT TRUE,
  custom_attributes_json JSON,
  callback_on_submit VARCHAR(150),
  submission_pdf_enabled BOOLEAN DEFAULT FALSE,
  submission_pdf_template ENUM('simple','branded') DEFAULT 'simple',
  is_multi_step BOOLEAN DEFAULT FALSE,
  allow_multiple_submissions BOOLEAN DEFAULT TRUE,
  limit_one_submission_per_user BOOLEAN DEFAULT FALSE,
  submission_limit INT,
  opens_at DATETIME,
  closes_at DATETIME,
  views_count INT UNSIGNED DEFAULT 0,
  submissions_count INT UNSIGNED DEFAULT 0,
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_forms_org_status (organization_id, status)
) ENGINE=InnoDB;

-- ---------- Campos del formulario (drag & drop builder) ----------
CREATE TABLE IF NOT EXISTS form_fields (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL UNIQUE,
  form_id INT UNSIGNED NOT NULL,
  field_key VARCHAR(100) NOT NULL,
  field_type ENUM(
    'text','textarea','email','password','number','phone','date','time','datetime',
    'select','multiselect','radio','checkbox','file','image','rating','recaptcha',
    'heading','paragraph','divider','hidden','signature','address'
  ) NOT NULL,
  label VARCHAR(255) NOT NULL,
  placeholder VARCHAR(255),
  help_text VARCHAR(500),
  position INT DEFAULT 0,
  step_number INT DEFAULT 1,
  is_required BOOLEAN DEFAULT FALSE,
  min_length INT,
  max_length INT,
  min_value DECIMAL(15,4),
  max_value DECIMAL(15,4),
  regex_pattern VARCHAR(255),
  validation_message VARCHAR(255),
  options_json JSON,
  default_value VARCHAR(500),
  allowed_file_types VARCHAR(255),
  max_file_size_mb INT DEFAULT 10,
  max_files INT DEFAULT 1,
  aria_label VARCHAR(255),
  aria_describedby_text VARCHAR(500),
  autocomplete_attr VARCHAR(50),
  conditional_logic_json JSON,
  custom_attributes_json JSON,
  width ENUM('full','half','third') DEFAULT 'full',
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  UNIQUE KEY uq_form_field_key (form_id, field_key),
  INDEX idx_fields_form_position (form_id, position)
) ENGINE=InnoDB;

-- ---------- Envíos de formularios ----------
CREATE TABLE IF NOT EXISTS form_submissions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL UNIQUE,
  form_id INT UNSIGNED NOT NULL,
  organization_id INT UNSIGNED NOT NULL,
  reference_id VARCHAR(80) NOT NULL,
  status ENUM('draft','completed','spam') DEFAULT 'completed',
  submitted_by_user_id INT UNSIGNED,
  respondent_email VARCHAR(150),
  ip_address VARCHAR(64),
  user_agent VARCHAR(500),
  source_url VARCHAR(500),
  recaptcha_score DECIMAL(3,2),
  pdf_path VARCHAR(500),
  raw_answers_json JSON NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  INDEX idx_submissions_form_date (form_id, submitted_at)
) ENGINE=InnoDB;

-- ---------- Respuestas normalizadas (EAV) para reportes estadísticos ----------
CREATE TABLE IF NOT EXISTS submission_answers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submission_id INT UNSIGNED NOT NULL,
  field_id INT UNSIGNED NOT NULL,
  field_key VARCHAR(100) NOT NULL,
  value_text TEXT,
  value_number DECIMAL(15,4),
  value_date DATETIME,
  FOREIGN KEY (submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES form_fields(id) ON DELETE CASCADE,
  INDEX idx_answers_field (field_id),
  INDEX idx_answers_submission (submission_id)
) ENGINE=InnoDB;

-- ---------- Archivos subidos en envíos ----------
CREATE TABLE IF NOT EXISTS submission_files (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submission_id INT UNSIGNED NOT NULL,
  field_id INT UNSIGNED NOT NULL,
  original_name VARCHAR(255),
  stored_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100),
  size_bytes INT UNSIGNED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES form_fields(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- Webhooks ----------
CREATE TABLE IF NOT EXISTS webhooks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  form_id INT UNSIGNED NOT NULL,
  url VARCHAR(500) NOT NULL,
  method ENUM('POST','PUT') DEFAULT 'POST',
  headers_json JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS webhook_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  webhook_id INT UNSIGNED NOT NULL,
  submission_id INT UNSIGNED NOT NULL,
  attempt INT DEFAULT 1,
  status_code INT,
  success BOOLEAN DEFAULT FALSE,
  response_body TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE,
  FOREIGN KEY (submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- Integraciones de email marketing (Mailchimp / Acelle) ----------
CREATE TABLE IF NOT EXISTS email_integrations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  form_id INT UNSIGNED NOT NULL,
  provider ENUM('mailchimp','acelle') NOT NULL,
  api_key VARCHAR(255),
  api_url VARCHAR(255),
  list_or_audience_id VARCHAR(150),
  field_mapping_json JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- Auditoría ----------
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id INT UNSIGNED,
  user_id INT UNSIGNED,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT UNSIGNED,
  metadata_json JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
