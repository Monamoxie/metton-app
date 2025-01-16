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
  key_name = module.keypair.key_name
  db_username = var.db_username
  db_password = var.db_password
}

module "security" {
  source = "./security"
  vpc_id = aws_vpc.default.id
}

