resource "aws_route53_zone" "default" {
  name = var.domain_name
}

 
# A record for the root domain pointing to the ALB
resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.default.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.default.dns_name
    zone_id                = aws_lb.default.zone_id
    evaluate_target_health = true
  }
}
 
# wildcard CNAME
resource "aws_route53_record" "subdomains" {
  zone_id = aws_route53_zone.default.zone_id
  name    = "*.${var.domain_name}"
  type    = "CNAME"
  ttl     = "300"
  records = [aws_lb.default.dns_name]
}


output "nameservers" {
  description = "Nameservers for the Route53 zone"
  value       = aws_route53_zone.default.name_servers
}


output "zone_id" {
  description = "The Route53 zone ID"
  value       = aws_route53_zone.default.zone_id
}