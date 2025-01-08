terraform {
    required_providers {
      aws = {
        source  = "hashicorp/aws"
      }
    }
    
    required_version = ">= 1.8.5"
}

provider "aws" {
  region                    = "us-east-1"
  shared_config_files       = var.shared_config_files
  shared_credentials_files  = var.shared_credentials_files
  profile                   = "metton_terraform"
}