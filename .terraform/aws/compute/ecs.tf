data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
data "aws_ecs_task_definition" "latest" {
  task_definition = "default-fargate-task"
}


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
  
  volume {
    name = "static_root"

    efs_volume_configuration {
      file_system_id = var.static_root_id
    }
  }

  volume {
    name = "media_root"

    efs_volume_configuration {
      file_system_id = var.media_root_id
    }
  }

  container_definitions = jsonencode([
    # Python Container
    {
      name              = "python_container"
      image            = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/python:latest"
      memoryReservation = 512
      cpu               = 256
      essential         = true

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group        = "/ecs/default-fargate-task/python"
          awslogs-region       = data.aws_region.current.name
          awslogs-stream-prefix = "python"
        }
      }

      portMappings = []

      secrets = [
        for name in [
          "PROJECT_ENV", "PROJECT_NAME", "SECRET_KEY", "DEBUG", "ALLOWED_HOSTS",
          "BASE_URL", "CELERY_BROKER_URL", "CSRF_TRUSTED_ORIGINS", "DB_ENGINE",
          "DB_HOST", "DB_HOST_PORT", "DB_NAME", "DB_PASSWORD", "DB_PORT", "DB_USER",
          "DEFAULT_FROM_EMAIL", "DEFAULT_FROM_NAME", "EMAIL_BACKEND", "EMAIL_HOST",
          "EMAIL_HOST_PASSWORD", "EMAIL_HOST_USER", "EMAIL_PORT",
          "RABBITMQ_DEFAULT_PASS", "RABBITMQ_DEFAULT_USER", "RABBITMQ_MGT_PORT",
          "RABBITMQ_PORT", "SERVER_EMAIL", "SERVER_PORT", "SERVER_NAME"
        ] :
        {
          name      = name
          valueFrom = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/${name}"
        }
      ]

      environment = [
        {
          name  = "UPSTREAM_SERVER"
          value = "127.0.0.1"
        }
      ]

      mountPoints = [
        {
          sourceVolume  = "media_root"
          containerPath = "/app/core/media"
        },
        {
          sourceVolume  = "static_root"
          containerPath = "/var/www/static"
        }
      ]
    },

    # Nginx Container
    {
      name              = "nginx_container"
      image            = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/nginx:latest"
      memoryReservation = 512
      cpu               = 256
      essential         = true

      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]

      environment = [
        {
          name  = "UPSTREAM_SERVER"
          value = "127.0.0.1"
        }
      ]

      secrets = [
        {
          name      = "SERVER_PORT"
          valueFrom = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/SERVER_PORT"
        },
        {
          name      = "SERVER_NAME"
          valueFrom = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/SERVER_NAME"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group        = "/ecs/default-fargate-task/nginx"
          awslogs-region       = data.aws_region.current.name
          awslogs-stream-prefix = "nginx"
        }
      }

      volumesFrom = [
        {
          sourceContainer = "python_container"
          readOnly        = true
        }
      ]
    }

  ])
  tags = {
    Name = "fargate-task"
  }
  
}

resource "aws_ecs_service" "default" {
  name            = "ecs-service"
  cluster         = aws_ecs_cluster.default.id
  task_definition  = try(
    data.aws_ecs_task_definition.latest.arn,
    aws_ecs_task_definition.default.arn
  )
  desired_count   = 1
  launch_type     = "FARGATE"
  enable_execute_command = true

  network_configuration {
    # todo @note: We are setting only 2 subnets because our Load balancer was setup to use only 2 of the available 3 subnets

    subnets         = [var.subnet_ids[0], var.subnet_ids[1]]
    security_groups = [var.security_group_id]
    assign_public_ip = true
  }

  deployment_circuit_breaker {
    enable = true
    rollback = true 
  }

  service_registries {
    registry_arn    = var.service_discovery_arn
  }

  load_balancer {
    target_group_arn = var.load_balancer_arn  
    container_name   = "nginx_container"
    container_port   = 80
  }

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200 
}