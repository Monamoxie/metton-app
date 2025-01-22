resource "aws_db_subnet_group" "default" {
  name       = "db-subnet-group"
  subnet_ids = [
    aws_subnet.default.id,
    aws_subnet.default_2.id,
    aws_subnet.default_3.id
  ]

  tags = {
    Name = "db-subnet-group"
  }
}