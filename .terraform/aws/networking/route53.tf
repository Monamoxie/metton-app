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


# DMARC (TXT Record)
resource "aws_route53_record" "dmarc" {
  zone_id = aws_route53_zone.default.zone_id
  name    = "_dmarc.${var.domain_name}"
  type    = "TXT"
  ttl     = 300

  records = ["v=DMARC1; p=none;"]

}

# SENDGRID
resource "aws_route53_record" "sendgrid_dkim_s1" {
  zone_id = aws_route53_zone.default.zone_id
  name    = "s1._domainkey.${var.domain_name}"
  type    = "CNAME"
  ttl     = 10
  records = [var.sendgrid_dkim_s1]
}

resource "aws_route53_record" "sendgrid_dkim_s2" {
  zone_id = aws_route53_zone.default.zone_id
  name    = "s2._domainkey.${var.domain_name}"
  type    = "CNAME"
  ttl     = 10
  records = [var.sendgrid_dkim_s2]
}



output "nameservers" {
  description = "Nameservers for the Route53 zone"
  value       = aws_route53_zone.default.name_servers
}


output "zone_id" {
  description = "The Route53 zone ID"
  value       = aws_route53_zone.default.zone_id
}