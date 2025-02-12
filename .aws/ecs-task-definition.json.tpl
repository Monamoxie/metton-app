{
  "family": "default-fargate-task",
  "containerDefinitions": [
    {
      "name": "python_container",
      "memoryReservation": 512,
      "cpu": 256,
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/default-fargate-task/python",
          "awslogs-region": "${AWS_REGION}",
          "awslogs-stream-prefix": "python"
        }
      },
      "portMappings": [],
      "secrets": [
        {
          "name": "PROJECT_ENV",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/PROJECT_ENV"
        },
        {
          "name": "PROJECT_NAME",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/PROJECT_NAME"
        },
        {
          "name": "SECRET_KEY",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/SECRET_KEY"
        },
        {
          "name": "DEBUG",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/DEBUG"
        },
        {
          "name": "ALLOWED_HOSTS",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/ALLOWED_HOSTS"
        },
        {
          "name": "BASE_URL",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/BASE_URL"
        },
        {
          "name": "CELERY_BROKER_URL",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/CELERY_BROKER_URL"
        },
        {
          "name": "CSRF_TRUSTED_ORIGINS",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/CSRF_TRUSTED_ORIGINS"
        },
        {
          "name": "DB_ENGINE",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/DB_ENGINE"
        },
        {
          "name": "DB_HOST",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/DB_HOST"
        },
        {
          "name": "DB_HOST_PORT",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/DB_HOST_PORT"
        },
        {
          "name": "DB_NAME",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/DB_NAME"
        },
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/DB_PASSWORD"
        },
        {
          "name": "DB_PORT",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/DB_PORT"
        },
        {
          "name": "DB_USER",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/DB_USER"
        },
        {
          "name": "DEFAULT_FROM_EMAIL",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/DEFAULT_FROM_EMAIL"
        },
        {
          "name": "DEFAULT_FROM_NAME",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/DEFAULT_FROM_NAME"
        },
        {
          "name": "EMAIL_BACKEND",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/EMAIL_BACKEND"
        },
        {
          "name": "EMAIL_HOST",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/EMAIL_HOST"
        },
        {
          "name": "EMAIL_HOST_PASSWORD",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/EMAIL_HOST_PASSWORD"
        },
        {
          "name": "EMAIL_HOST_USER",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/EMAIL_HOST_USER"
        },
        {
          "name": "EMAIL_PORT",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/EMAIL_PORT"
        },
        {
          "name": "RABBITMQ_DEFAULT_PASS",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/RABBITMQ_DEFAULT_PASS"
        },
        {
          "name": "RABBITMQ_DEFAULT_USER",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/RABBITMQ_DEFAULT_USER"
        },
        {
          "name": "RABBITMQ_MGT_PORT",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/RABBITMQ_MGT_PORT"
        },
        {
          "name": "RABBITMQ_PORT",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/RABBITMQ_PORT"
        },
        {
          "name": "SERVER_EMAIL",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/SERVER_EMAIL"
        },
        {
          "name": "SERVER_PORT",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/SERVER_PORT"
        },
        {
          "name": "SERVER_NAME",
           "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/SERVER_NAME"
        }
      ],
      "environment": [
        {
          "name": "UPSTREAM_SERVER",
          "value": "127.0.0.1"
        }
      ],
      "mountPoints": [
        {
          "sourceVolume": "media_root",
          "containerPath": "/app/core/media"
        },
        {
          "sourceVolume": "static_root",
          "containerPath": "/var/www/static"
        }
      ]
    },
    {
      "name": "nginx_container",
      "memoryReservation": 512,
      "cpu": 256,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 80
        }
      ],
      "environment": [
        {
          "name": "UPSTREAM_SERVER",
          "value": "127.0.0.1"
        }
      ],
      "secrets": [
        {
          "name": "SERVER_PORT",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/SERVER_PORT"
        },
        {
          "name": "SERVER_NAME",
          "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/SERVER_NAME"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/fargate-task/nginx",
          "awslogs-region": "${AWS_REGION}",
          "awslogs-stream-prefix": "nginx"
        }
      },
      "volumesFrom": [
        {
          "sourceContainer": "metton_python_container",
          "readOnly": true
        }
      ]
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "cpu": "512",
  "memory": "1024",
  "tags": [
    {
      "key": "Name",
      "value": "default-fargate-task"
    }
  ],
  "executionRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "volumes": [
    {
      "name": "static_root",
      "efsVolumeConfiguration": {
        "fileSystemId": "{{ .Values.STATIC_ROOT_ID }}"
      }
    },
    {
      "name": "media_root",
      "efsVolumeConfiguration": {
        "fileSystemId": "{{ .Values.MEDIA_ROOT_ID }}"
      }
    }
  ]
}
