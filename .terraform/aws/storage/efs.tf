resource "aws_efs_file_system" "static_root" {
  creation_token = "static-${random_string.efs_suffix.result}"
  performance_mode = "generalPurpose"
  encrypted = true
  kms_key_id = var.kms_efs_arn  

  tags = {
    Name = "static_root"
    "aws:elasticfilesystem:default-backup" = "enabled"
  }
}

resource "aws_efs_file_system" "media_root" {
  creation_token = "media-${random_string.efs_suffix.result}"
  performance_mode = "generalPurpose"
  encrypted = true
  kms_key_id = var.kms_efs_arn  

  tags = {
    Name = "media_root"
    "aws:elasticfilesystem:default-backup" = "enabled"
  }
}

resource "aws_efs_mount_target" "static_root" {
  count = length(var.subnet_ids) 
  file_system_id = aws_efs_file_system.static_root.id
  subnet_id = var.subnet_ids[count.index]   
}

resource "aws_efs_mount_target" "media_root" {
  count = length(var.subnet_ids) 
  file_system_id = aws_efs_file_system.media_root.id
  subnet_id = var.subnet_ids[count.index]   
}

resource "random_string" "efs_suffix" {
  length  = 8
  special = false
}

output "static_root_id" {
  value = aws_efs_file_system.static_root.id
}

output "media_root_id" {
  value = aws_efs_file_system.media_root.id
}