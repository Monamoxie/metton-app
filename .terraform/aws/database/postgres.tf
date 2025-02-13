resource "aws_db_instance" "default" {
    identifier          = "default"
    allocated_storage    = 20
    db_name              = var.db_name
    engine               = "postgres"
    engine_version       = "17.2"
    instance_class       = "db.t3.micro"
 
    vpc_security_group_ids = [var.security_group_id]
    db_subnet_group_name   = var.db_subnet_group
  
    username             = var.db_user
    password             = var.db_password

  parameter_group_name = "default.postgres15"
  skip_final_snapshot  = true
  publicly_accessible  = false
}