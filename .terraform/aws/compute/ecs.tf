data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

resource "aws_ecs_cluster" "default" {
  name = "default"
}

resource "aws_ecs_task_definition" "default" {
  family                   = "default-fargate-task"
  execution_role_arn       = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/ecsTaskExecutionRole"
  task_role_arn            = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/ecsTaskExecutionRole"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"

  container_definitions = templatefile("${path.module}/ecs-task-definition.json.tpl", {
    AWS_ACCOUNT_ID =  data.aws_caller_identity.current.account_id
    AWS_REGION     =  data.aws_region.current.name 
    MEDIA_ROOT_ID  =  var.media_root_id
    STATIC_ROOT_ID =  var.static_root_id
  })
}

resource "aws_ecs_service" "default" {
  name            = "ecs-service"
  cluster         = aws_ecs_cluster.default.id
  task_definition  = aws_ecs_task_definition.default.arn
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