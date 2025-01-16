/**
 * ****************************************************************************
 * SECURITY GROUP 
 * ****************************************************************************
*/
resource "aws_security_group" "default" {
  name        = "default"
  description = "Allow TLS inbound traffic and all outbound traffic"
  vpc_id      = var.vpc_id

  tags = {
    Name = "default"
  }
}

/**
 * ****************************************************************************
 * OUTGOING CONNECTION ::: IPV4 
 * ****************************************************************************
*/
resource "aws_vpc_security_group_egress_rule" "outbound_ipv4" {
  security_group_id = aws_security_group.default.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

/**
 * ****************************************************************************
 *  OUTGOING CONNECTION ::: IPV6 
 * ****************************************************************************
*/
resource "aws_vpc_security_group_egress_rule" "outbound_ipv6" {
  security_group_id = aws_security_group.default.id
  cidr_ipv6         = "::/0"
  ip_protocol       = "-1"
}



/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT 80 IPV4
 * ****************************************************************************
*/
resource "aws_vpc_security_group_inbound_rule" "inbound_http_ipv4" {
    security_group_id = aws_security_group.default.id
    cidr_ipv4         = "0.0.0.0/0"
    from_port         = 80
    to_port           = 80
    ip_protocol       = "tcp"
}

/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT 80 IPV6
 * ****************************************************************************
*/
resource "aws_vpc_security_group_inbound_rule" "inbound_http_ipv6" {
  security_group_id = aws_security_group.default.id
  cidr_ipv6         = "::/0"
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
}


/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT 443 IPV4
 * ****************************************************************************
*/
resource "aws_vpc_security_group_inbound_rule" "inbound_https_ipv4" {
    security_group_id = aws_security_group.default.id
    cidr_ipv4         = "0.0.0.0/0"
    from_port         = 443
    to_port           = 443
    ip_protocol       = "tcp"
}

/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT 443 IPV6
 * ****************************************************************************
*/
resource "aws_vpc_security_group_inbound_rule" "inbound_https_ipv6" {
    security_group_id = aws_security_group.default.id
    cidr_ipv6         = "::/0"
    from_port         = 443
    to_port           = 443
    ip_protocol       = "tcp"
}

/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT 3306 MYSQL
 * ****************************************************************************
*/

resource "aws_vpc_security_group_inbound_rule" "inbound_mysql" {
    security_group_id = aws_security_group.default.id
    cidr_ipv4         = "0.0.0.0/0"
    from_port         = 3306
    to_port           = 3306
    ip_protocol       = "tcp"
}

/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT 22 SSH
 * ****************************************************************************
*/
resource "aws_vpc_security_group_inbound_rule" "inbound_ssh" {
    security_group_id = aws_security_group.default.id
    from_port         = 22
    to_port           = 22
    ip_protocol       = "tcp"
    cidr_ipv4         = "0.0.0.0/0"
}



/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT -1 ICMP
 * ****************************************************************************
*/
resource "aws_vpc_security_group_inbound_rule" "inbound_icmp" {
    security_group_id = aws_security_group.default.id
    from_port         = -1
    to_port           = -1
    ip_protocol          = "icmp"
    cidr_ipv4         = "0.0.0.0/0"
    description       = "Allow ICMP (ping) from anywhere"
}