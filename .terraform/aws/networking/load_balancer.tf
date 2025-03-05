# Target Group
resource "aws_lb_target_group" "default" {
  name     = "target-group"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
  }

  target_type = "ip"
}


resource "aws_lb" "default" {
  name               = "default-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = [
    aws_subnet.default.id,
    aws_subnet.default_2.id

    # todo @note ::: 
    # You can add as many available subnets as you wish but note that:
    # AWS, from 1 Feb 2024, charges $0.005 per IP address per hour whether attached to a service or not
    # Every subnet assigned to a public-facing load balancer gets it's own unique network interface and 
    # these network interface could have a public IP, which is chargeable
    # If on free tier, the public IP attached to your EC2 is free for up to 750 hrs / month
    # But any other assigned public IPs would be charged for. 

    # aws_subnet.default_3.id,
  ]
}



resource "aws_lb_listener" "https_listener" {
  load_balancer_arn = aws_lb.default.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"  

  certificate_arn   = var.aws_acm_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.default.arn
  }
}


resource "aws_lb_listener" "default" {
  load_balancer_arn = aws_lb.default.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      protocol   = "HTTPS"
      port       = "443"
      status_code = "HTTP_301"
    }
  }
}

output "load_balancer_arn" {
  value = aws_lb_target_group.default.arn
}