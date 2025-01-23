/**
 * ****************************************************************************
 * SUB NET
 * ****************************************************************************
*/
resource "aws_subnet" "default" {
  vpc_id            = var.vpc_id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  tags = {
    Name = "default"
  }
}

resource "aws_subnet" "default_2" {
  vpc_id            = var.vpc_id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1b"
  tags = {
    Name = "second-subnet"
  }
}

resource "aws_subnet" "default_3" {
  vpc_id            = var.vpc_id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "us-east-1c"
  tags = {
    Name = "third-subnet"
  }
}

output "subnet_ids" {
  description = "subnet IDs"
  value       = [
    aws_subnet.default.id,
    aws_subnet.default_2.id,
    aws_subnet.default_3.id,
  ]
}