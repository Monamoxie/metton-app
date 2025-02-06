resource "aws_ecs_cluster" "default" {
  name = "default"
}

resource "aws_ecs_service" "default" {
  name            = "ecs-service"
  cluster         = aws_ecs_cluster.default.id
  desired_count   = 2
  launch_type     = "FARGATE"

  service_registries {
    subnets         = var.subnet_ids
    registry_arn    = var.service_discovery_arn
    security_groups = var.security_group_id
  }
}