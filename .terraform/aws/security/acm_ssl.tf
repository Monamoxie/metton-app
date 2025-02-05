resource "aws_acm_certificate" "default" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = var.domain_alternative_names

  tags = {
    Name = "default-cert"
  }

   lifecycle {
    create_before_destroy = true
  }
}



# Simply looping over all the records will attempt to create the same CNAME records twice, both times using the same name and value. 
# To fix this, we take the first index of the cert and use that for the validation, since aws returned the same cert and cname records for both root and wildcard

resource "aws_route53_record" "cert_validation" {
  count = length(aws_acm_certificate.default.domain_validation_options) > 0 ? 1 : 0

  zone_id = var.zone_id
  name    = tolist(aws_acm_certificate.default.domain_validation_options)[0].resource_record_name
  type    = tolist(aws_acm_certificate.default.domain_validation_options)[0].resource_record_type
  ttl     = 300
  records = [tolist(aws_acm_certificate.default.domain_validation_options)[0].resource_record_value]
}


resource "aws_acm_certificate_validation" "cert_validation" {
  certificate_arn         = aws_acm_certificate.default.arn
  validation_record_fqdns = [aws_route53_record.cert_validation[0].fqdn]
}


output "aws_acm_certificate_arn" {
  description = "aws acm cert arn"
  value       = aws_acm_certificate.default.arn
}