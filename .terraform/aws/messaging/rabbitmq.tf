resource "aws_mq_broker" "default" {
  broker_name = "default"
  engine_type = "RabbitMQ"
  engine_version = "3.8.6"  
  host_instance_type = "mq.t2.micro" type
  publicly_accessible = true

  user {
    username = var.rabbitmq_username
    password = var.rabbitmq_password
  }

  tags = {
    Name = "default"
  }
}