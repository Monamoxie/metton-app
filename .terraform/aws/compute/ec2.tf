/**
 * ****************************************************************************
 * EC2
 * ****************************************************************************
*/
resource "aws_instance" "default" {
    ami = "ami-04a81a99f5ec58529" // set ami based on your preference on aws
    instance_type = "t3.micro"
    vpc_security_group_ids = [var.security_group_id]
    key_name       = var.key_name
    subnet_id      = var.subnet_ids[0]
    associate_public_ip_address = true
    
    tags = {
        Name = "default"
    }
}

output "instance_ip" {
  value = aws_instance.default.public_ip
}

output "ec2_instance_id" {
  value = aws_instance.default.id
}