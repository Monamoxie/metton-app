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
}

module "security" {
  source = "./security"
  vpc_id = aws_vpc.default.id
  domain_name = var.domain_name
  domain_alternative_names = var.domain_alternative_names
  ec2_key_pair_name = var.ec2_key_pair_name
  zone_id = module.networking.zone_id
}

# Database module
module "database" {
  source = "./database"
  
  # Database configuration
  db_name     = var.db_name
  db_username = var.db_username
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
}

module "messaging" {
  source = "./messaging"
  rabbitmq_username = var.rabbitmq_username
  rabbitmq_password = var.rabbitmq_password
}

module "monitoring" {
  source = "./monitoring"
}