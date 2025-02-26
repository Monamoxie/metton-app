variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "development"
}

variable "domain_name" {
  description = "Production domain name"
  type = string
}

variable "domain_alternative_names" {
  description = "Production subdomains or wildcard"
  type = list(string)
}

variable "profile" {
  description = "Aws profile. Set in /Users/admin/.aws/config or whereever your development aws config is stored. To also be referenced and defined in terraform.tfvars, which MUST NOT be tracked by git"
  type = string
}

variable "aws_region" {
  description = "Aws region"
  type = string
}

variable "shared_config_files" {
  description = "Path to aws config. Could be /Users/admin/.aws/config or wherever you've created it. Should contain the aws profile and the region"
  type = list(string)
}

variable "shared_credentials_files" {
  description = "Credentials file. Coule be /Users/admin/.aws/credentials or wherever you've created it. Should be grouped by aws profile, and this profile should contain the access key and secret required for terraform to authenticate and access the account"
  type = list(string)
}

variable "ec2_key_pair_name" {
  description = "Name of ec2 key pair public file"
  type = string
}


variable "rabbitmq_username" {
  description = "RabbitMQ Username"
  type = string
}

variable "rabbitmq_password" {
  description = "RabbitMQ Password"
  type = string
}

variable "sendgrid_dkim_s1" {
  description = "Sendgrid DKIM S1"
  type = string
}
variable "sendgrid_dkim_s2" {
  description = "Sendgrid DKIM S2"
  type = string
}


# Parameter store
variable "access_secret" {}
variable "base_url" {}
variable "db_host" {}
variable "db_host_port" {}
variable "db_port" {}
variable "debug" {}
variable "email_port" {}
variable "rabbitmq_default_pass" {}
variable "rabbitmq_mgt_port" {}
variable "upstream_server" {}
variable "db_name" {}
variable "db_root_password" {}
variable "db_user" {}
variable "default_from_email" {}
variable "email_backend" {}
variable "email_host_user" {}
variable "project_env" {}
variable "project_name" {}
variable "rabbitmq_port" {}
variable "server_name" {}
variable "access_key_id" {}
variable "allowed_hosts" {}
variable "csrf_trusted_origins" {}
variable "db_engine" {}
variable "email_host" {}
variable "email_host_password" {}
variable "rabbitmq_default_user" {}
variable "secret_key" {}
variable "server_email" {}
variable "server_port" {}
variable "celery_broker_url" {}
variable "db_password" {}
variable "default_from_name" {}

variable "aws_account_id" {}