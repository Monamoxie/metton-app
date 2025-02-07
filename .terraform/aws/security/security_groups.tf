/**
 * ****************************************************************************
 * SECURITY GROUP 
 * ****************************************************************************
*/
resource "aws_security_group" "custom_default" {
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
  security_group_id = aws_security_group.custom_default.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

/**
 * ****************************************************************************
 *  OUTGOING CONNECTION ::: IPV6 
 * ****************************************************************************
*/
resource "aws_vpc_security_group_egress_rule" "outbound_ipv6" {
  security_group_id = aws_security_group.custom_default.id
  cidr_ipv6         = "::/0"
  ip_protocol       = "-1"
}



/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT 80 IPV4
 * ****************************************************************************
*/
resource "aws_security_group_rule" "inbound_http_ipv4" {
    type              = "ingress"
    protocol          = "tcp"
    security_group_id = aws_security_group.custom_default.id
    cidr_blocks       = ["0.0.0.0/0"]
    from_port         = 80
    to_port           = 80
}


/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT 443 IPV4
 * ****************************************************************************
*/
resource "aws_security_group_rule" "inbound_https_ipv4" {
    security_group_id = aws_security_group.custom_default.id
    type              = "ingress"
    cidr_blocks       = ["0.0.0.0/0"]
    from_port         = 443
    to_port           = 443
    protocol       = "tcp"
}


/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT 5432 postgres
 * ****************************************************************************
*/

resource "aws_security_group_rule" "inbound_postgres" {
    type              = "ingress"
    security_group_id = aws_security_group.custom_default.id
    cidr_blocks       = ["0.0.0.0/0"]
    from_port         = 5432
    to_port           = 5432
    protocol          = "tcp"
}

/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT 5672 rabbitmq
 * ****************************************************************************
*/
resource "aws_security_group_rule" "inbound_rabbitmq" {
    type              = "ingress"
    security_group_id = aws_security_group.custom_default.id
    cidr_blocks       = ["0.0.0.0/0"]
    from_port         = 5672
    to_port           = 5672
    protocol          = "tcp"
}

/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT 5671 rabbitmq amqp
 * ****************************************************************************
*/
resource "aws_security_group_rule" "inbound_rabbitmq_amqp" {
    type              = "ingress"
    security_group_id = aws_security_group.custom_default.id
    cidr_blocks       = ["0.0.0.0/0"]
    from_port         = 5671
    to_port           = 5671
    protocol          = "tcp"
}

/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT 15672 rabbitmq mgt
 * ****************************************************************************
*/
resource "aws_security_group_rule" "inbound_rabbitmq_mgt" {
    type              = "ingress"
    security_group_id = aws_security_group.custom_default.id
    cidr_blocks       = ["0.0.0.0/0"]
    from_port         = 15672
    to_port           = 15672
    protocol          = "tcp"
}

/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT 2049 NFS
 * ****************************************************************************
*/
resource "aws_security_group_rule" "inbound_nfs" {
    type              = "ingress"
    security_group_id = aws_security_group.custom_default.id
    cidr_blocks       = ["0.0.0.0/0"]
    from_port         = 2049
    to_port           = 2049
    protocol          = "tcp"
}

/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT 22 SSH
 * ****************************************************************************
*/
resource "aws_security_group_rule" "inbound_ssh" {
    type              = "ingress"
    security_group_id = aws_security_group.custom_default.id
    from_port         = 22
    to_port           = 22
    protocol       = "tcp"
    cidr_blocks       = ["0.0.0.0/0"]
}



/**
 * ****************************************************************************
 * INCOMING CONNECTION ::: PORT -1 ICMP
 * ****************************************************************************
*/
resource "aws_security_group_rule" "inbound_icmp" {
    type              = "ingress"
    security_group_id = aws_security_group.custom_default.id
    from_port         = -1
    to_port           = -1
    protocol       = "icmp"
    cidr_blocks       = ["0.0.0.0/0"]
    description       = "Allow ICMP (ping) from anywhere"
}

output "security_group_id" {
  description = "ID of the database security group"
  value       = aws_security_group.custom_default.id
}