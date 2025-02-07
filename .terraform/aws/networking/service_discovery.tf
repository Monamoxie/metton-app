resource "aws_service_discovery_service" "default" {
  name = "ecs-discovery-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.default.id
    
    dns_records {
      type = "A"
      ttl  = 10
    }
  }
}
 
resource "aws_service_discovery_private_dns_namespace" "default" {
  name = "default.local"
  vpc  = var.vpc_id   
}

output "service_discovery_arn" {
  description = "Service discovery arn"
  value = aws_service_discovery_service.default.arn
}