resource "aws_cloudwatch_log_group" "nginx" {
  name              = "/ecs/default-fargate-task/nginx"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "python" {
  name              = "/ecs/default-fargate-task/python"
  retention_in_days = 7
}
