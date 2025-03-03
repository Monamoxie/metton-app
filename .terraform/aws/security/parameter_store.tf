resource "aws_ssm_parameter" "access_secret" {
  name  = "/ACCESS_SECRET"
  type  = "SecureString"
  value = var.access_secret
}

resource "aws_ssm_parameter" "base_url" {
  name  = "/BASE_URL"
  type  = "SecureString"
  value = var.base_url
}

resource "aws_ssm_parameter" "db_host" {
  name  = "/DB_HOST"
  type  = "SecureString"
  value = var.db_host
}

resource "aws_ssm_parameter" "db_host_port" {
  name  = "/DB_HOST_PORT"
  type  = "SecureString"
  value = var.db_host_port
}

resource "aws_ssm_parameter" "db_port" {
  name  = "/DB_PORT"
  type  = "SecureString"
  value = var.db_port
}

resource "aws_ssm_parameter" "debug" {
  name  = "/DEBUG"
  type  = "SecureString"
  value = var.debug
}

resource "aws_ssm_parameter" "email_port" {
  name  = "/EMAIL_PORT"
  type  = "SecureString"
  value = var.email_port
}

resource "aws_ssm_parameter" "rabbitmq_default_pass" {
  name  = "/RABBITMQ_DEFAULT_PASS"
  type  = "SecureString"
  value = var.rabbitmq_default_pass
}

resource "aws_ssm_parameter" "rabbitmq_mgt_port" {
  name  = "/RABBITMQ_MGT_PORT"
  type  = "SecureString"
  value = var.rabbitmq_mgt_port
}

resource "aws_ssm_parameter" "upstream_server" {
  name  = "/UPSTREAM_SERVER"
  type  = "SecureString"
  value = var.upstream_server
}

resource "aws_ssm_parameter" "db_name" {
  name  = "/DB_NAME"
  type  = "SecureString"
  value = var.db_name
}

resource "aws_ssm_parameter" "db_root_password" {
  name  = "/DB_ROOT_PASSWORD"
  type  = "SecureString"
  value = var.db_root_password
}

resource "aws_ssm_parameter" "db_user" {
  name  = "/DB_USER"
  type  = "SecureString"
  value = var.db_user
}

resource "aws_ssm_parameter" "default_from_email" {
  name  = "/DEFAULT_FROM_EMAIL"
  type  = "SecureString"
  value = var.default_from_email
}

resource "aws_ssm_parameter" "email_backend" {
  name  = "/EMAIL_BACKEND"
  type  = "SecureString"
  value = var.email_backend
}

resource "aws_ssm_parameter" "email_host_user" {
  name  = "/EMAIL_HOST_USER"
  type  = "SecureString"
  value = var.email_host_user
}

resource "aws_ssm_parameter" "project_env" {
  name  = "/PROJECT_ENV"
  type  = "SecureString"
  value = var.project_env
}

resource "aws_ssm_parameter" "project_name" {
  name  = "/PROJECT_NAME"
  type  = "SecureString"
  value = var.project_name
}

resource "aws_ssm_parameter" "rabbitmq_port" {
  name  = "/RABBITMQ_PORT"
  type  = "SecureString"
  value = var.rabbitmq_port
}

resource "aws_ssm_parameter" "server_name" {
  name  = "/SERVER_NAME"
  type  = "SecureString"
  value = var.server_name
}

resource "aws_ssm_parameter" "access_key_id" {
  name  = "/ACCESS_KEY_ID"
  type  = "SecureString"
  value = var.access_key_id
}

resource "aws_ssm_parameter" "allowed_hosts" {
  name  = "/ALLOWED_HOSTS"
  type  = "SecureString"
  value = var.allowed_hosts
}

resource "aws_ssm_parameter" "csrf_trusted_origins" {
  name  = "/CSRF_TRUSTED_ORIGINS"
  type  = "SecureString"
  value = var.csrf_trusted_origins
}

resource "aws_ssm_parameter" "db_engine" {
  name  = "/DB_ENGINE"
  type  = "SecureString"
  value = var.db_engine
}

resource "aws_ssm_parameter" "email_host" {
  name  = "/EMAIL_HOST"
  type  = "SecureString"
  value = var.email_host
}

resource "aws_ssm_parameter" "email_host_password" {
  name  = "/EMAIL_HOST_PASSWORD"
  type  = "SecureString"
  value = var.email_host_password
}

resource "aws_ssm_parameter" "rabbitmq_default_user" {
  name  = "/RABBITMQ_DEFAULT_USER"
  type  = "SecureString"
  value = var.rabbitmq_default_user
}

resource "aws_ssm_parameter" "secret_key" {
  name  = "/SECRET_KEY"
  type  = "SecureString"
  value = var.secret_key
}

resource "aws_ssm_parameter" "server_email" {
  name  = "/SERVER_EMAIL"
  type  = "SecureString"
  value = var.server_email
}

resource "aws_ssm_parameter" "server_port" {
  name  = "/SERVER_PORT"
  type  = "SecureString"
  value = var.server_port
}

resource "aws_ssm_parameter" "celery_broker_url" {
  name  = "/CELERY_BROKER_URL"
  type  = "SecureString"
  value = var.celery_broker_url
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/DB_PASSWORD"
  type  = "SecureString"
  value = var.db_password
}

resource "aws_ssm_parameter" "default_from_name" {
  name  = "/DEFAULT_FROM_NAME"
  type  = "String"
  value = var.default_from_name
}

resource "aws_ssm_parameter" "has_privacy_policy" {
  name  = "/HAS_PRIVACY_POLICY"
  type  = "String"
  value = var.has_privacy_policy
}

resource "aws_ssm_parameter" "privacy_policy_url" {
  name  = "/PRIVACY_POLICY_URL"
  type  = "String"
  value = var.privacy_policy_url
}

resource "aws_ssm_parameter" "has_terms_of_service" {
  name  = "/HAS_TERMS_OF_SERVICE"
  type  = "String"
  value = var.has_terms_of_service
}

resource "aws_ssm_parameter" "terms_of_service_url" {
  name  = "/TERMS_OF_SERVICE_URL"
  type  = "String"
  value = var.terms_of_service_url
}


