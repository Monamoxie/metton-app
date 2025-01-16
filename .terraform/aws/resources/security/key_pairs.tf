# Default keypair to access your ec2 instance
# This should be created on your dev machine/workstation, prior to running terraform
# Create key pair and follow the prompt: ssh-keygen -t ed25519 -C "name-or-identifier"
# Add path to file to ~/.aws/credentials, under the profile specified in main.tf

resource "aws_key_pair" "ec2_key_pair" {
  key_name   = "ec2-key-pair"
  public_key = file(var.key_pair_filename)
}

output "key_name" {
  value = aws_key_pair.ec2_key_pair.key_name
}