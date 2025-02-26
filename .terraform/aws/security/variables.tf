variable "vpc_id" {
  description = "The ID of the VPC where the security group will be created"
}

variable "ec2_key_pair_name" {
  description = "The name of the key-pair public file"
  type        = string
}

variable "domain_name" {
  description = "The domain name for Route53 records"
  type        = string
}

variable "domain_alternative_names" {
  description = "The alternative domain names"
  type        = list(string)
}

variable "zone_id" {
  description = "Route 53 zone id"
  type        = string
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
variable "aws_region" {}

variable "static_root_id" {}
variable "media_root_id" {}