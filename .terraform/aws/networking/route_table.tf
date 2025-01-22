/**
 * ****************************************************************************
 * Route Table
 * ****************************************************************************
 */
resource "aws_route_table" "default" {
  vpc_id = var.vpc_id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.default.id
  }
  tags = {
    Name = "default"
  }
}

# Create route table associations for all subnets
resource "aws_route_table_association" "subnet_1" {
  subnet_id      = aws_subnet.default.id
  route_table_id = aws_route_table.default.id
}

resource "aws_route_table_association" "subnet_2" {
  subnet_id      = aws_subnet.default_2.id
  route_table_id = aws_route_table.default.id
}

resource "aws_route_table_association" "subnet_3" {
  subnet_id      = aws_subnet.default_3.id
  route_table_id = aws_route_table.default.id
}