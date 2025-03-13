terraform {
    required_providers {
      aws = {
        source  = "hashicorp/aws"
      }
    }
    
    required_version = ">= 1.8.5"
}

provider "aws" {
  region                    = var.aws_region
  shared_config_files       = var.shared_config_files
  shared_credentials_files  = var.shared_credentials_files
  profile                   = var.profile
}


/**
 * ****************************************************************************
 * VPC
 * ****************************************************************************
*/
resource "aws_vpc" "default" {
  cidr_block = "10.0.0.0/16"

  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "default"
  }
}

module "compute" {
  source = "./compute"
  vpc_id = aws_vpc.default.id
  cidr_ipv4_block = aws_vpc.default.cidr_block
  key_name = module.security.key_name
  security_group_id = module.security.security_group_id
  subnet_ids = module.networking.subnet_ids
  service_discovery_arn = module.networking.service_discovery_arn
  static_root_id = module.storage.static_root_id
  media_root_id = module.storage.media_root_id
  load_balancer_arn = module.networking.load_balancer_arn
}

module "networking" {
  source = "./networking"
  vpc_id = aws_vpc.default.id
  security_group_id = module.security.security_group_id
  aws_acm_certificate_arn = module.security.aws_acm_certificate_arn
  ec2_instance_id = module.compute.ec2_instance_id
  domain_name = var.domain_name
  domain_alternative_names = var.domain_alternative_names
  sendgrid_dkim_s1 = var.sendgrid_dkim_s1
  sendgrid_dkim_s2 = var.sendgrid_dkim_s2
  alb_security_group_id = module.security.alb_security_group_id
}

# Security module module
module "security" {
  source = "./security"
  vpc_id = aws_vpc.default.id
  domain_name = var.domain_name
  domain_alternative_names = var.domain_alternative_names
  ec2_key_pair_name = var.ec2_key_pair_name
  zone_id = module.networking.zone_id
  my_ip_address = var.my_ip_address

  access_secret = var.access_secret
  access_key_id = var.access_key_id
  base_url = var.base_url
  db_host = var.db_host
  db_host_port = var.db_host_port
  db_port = var.db_port
  debug = var.debug
  email_port = var.email_port
  rabbitmq_default_pass = var.rabbitmq_default_pass
  rabbitmq_mgt_port = var.rabbitmq_mgt_port
  upstream_server=var.upstream_server
  db_name=var.db_name
  db_root_password=var.db_root_password
  db_user=var.db_user
  default_from_email=var.default_from_email
  email_backend=var.email_backend
  email_host_user=var.email_host_user
  project_env=var.project_env
  project_name=var.project_name
  rabbitmq_port=var.rabbitmq_port
  server_name=var.server_name
  allowed_hosts=var.allowed_hosts
  csrf_trusted_origins=var.csrf_trusted_origins
  db_engine=var.db_engine
  email_host=var.email_host
  email_host_password=var.email_host_password
  rabbitmq_default_user=var.rabbitmq_default_user
  secret_key=var.secret_key
  server_email=var.server_email
  server_port=var.server_port
  celery_broker_url=var.celery_broker_url
  db_password=var.db_password
  default_from_name=var.default_from_name
  aws_region     = var.aws_region
  aws_account_id = var.aws_account_id
  static_root_id = module.storage.static_root_id
  media_root_id = module.storage.media_root_id

  has_privacy_policy=var.has_privacy_policy
  privacy_policy_url=var.privacy_policy_url
  has_terms_of_service=var.has_terms_of_service
  terms_of_service_url=var.terms_of_service_url

  HAS_COOKIES_CONSENT_MODE=var.HAS_COOKIES_CONSENT_MODE

  HAS_GOOGLE_TAG_MANAGER=var.HAS_GOOGLE_TAG_MANAGER
  GOOGLE_TAG_MANAGER_ID=var.GOOGLE_TAG_MANAGER_ID

  HAS_GOOGLE_RECAPTCHA=var.HAS_GOOGLE_RECAPTCHA
  GOOGLE_RECAPTCHA_SITE_KEY=var.GOOGLE_RECAPTCHA_SITE_KEY
  GOOGLE_RECAPTCHA_SECRET_KEY=var.GOOGLE_RECAPTCHA_SECRET_KEY
  }

# Database module
module "database" {
  source = "./database"
  
  # Database configuration
  db_name     = var.db_name
  db_user = var.db_user
  db_password = var.db_password
  
  # Network configuration
  security_group_id = module.security.security_group_id
  db_subnet_group = module.networking.db_subnet_group
}

module "storage" {
  source = "./storage"
  
  project_name = var.project_name
  environment  = var.environment
  kms_efs_arn = module.security.kms_efs_arn
  subnet_ids = module.networking.subnet_ids
  region     = var.aws_region
  security_group_id = module.security.security_group_id
}

module "messaging" {
  source = "./messaging"
  rabbitmq_username = var.rabbitmq_username
  rabbitmq_password = var.rabbitmq_password
}

module "monitoring" {
  source = "./monitoring"
}


output "github_secrets_message" {
  value = module.security.github_secrets_message
}