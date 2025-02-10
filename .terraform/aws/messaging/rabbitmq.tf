resource "aws_mq_broker" "default" {
  broker_name = "default"
  engine_type = "RabbitMQ"
  engine_version = "3.12.13"  
  host_instance_type = "mq.t3.micro"
  publicly_accessible = true

  user {
    username = var.rabbitmq_username
    password = var.rabbitmq_password
  }

  tags = {
    Name = "default"
  }
}