resource "aws_ecs_cluster" "default" {
  name = "default"
}

resource "aws_ecs_service" "default" {
  name            = "ecs-service"
  cluster         = aws_ecs_cluster.default.id
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.subnet_ids
    security_groups = [var.security_group_id]
    assign_public_ip = true
  }

  service_registries {
    registry_arn    = var.service_discovery_arn
  }
}