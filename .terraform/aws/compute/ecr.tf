resource "aws_ecr_repository" "default" {
  name                 = "default"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "default" {
  repository = aws_ecr_repository.default.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Delete untagged images older than 24 hours"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Keep only the latest tagged image for each service"
        selection = {
          tagStatus   = "tagged"
          countType   = "imageCountMoreThan"
          tagPrefixList = ["latest"]
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
