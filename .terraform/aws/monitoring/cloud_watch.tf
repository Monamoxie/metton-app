resource "aws_cloudwatch_log_group" "nginx" {
  name              = "/ecs/nginx"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "python" {
  name              = "/ecs/python"
  retention_in_days = 7
}
