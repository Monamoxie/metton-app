resource "aws_kms_key" "efs_kms_key" {
  description = "KMS key for EFS encryption"
  key_usage   = "ENCRYPT_DECRYPT"

  tags = {
    Name = "EFS KMS Key"
  }
}

output "kms_efs_arn" {
    description = "The KMS ARN for EFS"
    value = aws_kms_key.efs_kms_key.arn
}