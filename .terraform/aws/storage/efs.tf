resource "aws_efs_file_system" "default" {
  creation_token = "my-efs-${random_string.efs_suffix.result}"
  performance_mode = "generalPurpose"
  encrypted = true
  kms_key_id = var.kms_efs_arn  

  tags = {
    Name = "default"
    "aws:elasticfilesystem:default-backup" = "enabled"
  }
}

resource "aws_efs_mount_target" "default" {
  count = length(var.subnet_ids) 
  file_system_id = aws_efs_file_system.default.id
  subnet_id = var.subnet_ids[count.index]   
}

resource "random_string" "efs_suffix" {
  length  = 8
  special = false
}