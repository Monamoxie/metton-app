<p align="left"><img src="src/api/core/static/images/logo.png"></p>

# METTON

A full-stack web app powered by Python and Django, designed to provide seamless and efficient calendar management solution. 

Whether you are a solopreneur, SME, or a startup, Metton helps you optimize your schedules, enhance client interactions, and drive your business forward.

[![Github Actions](https://github.com/Monamoxie/metton-python-utility-scheduler/actions/workflows/metton.yml/badge.svg)](https://github.com/Monamoxie/metton-python-utility-scheduler/actions/workflows/metton.yml)

</p>

## Technology Stack

- Python
- RabbitMQ / Celery
- PostgreSQL
- Docker
- Django
- Gunicorn
- Nginx
- TypeScript
- React Js
- Next Js
- Material UI

## PRODUCTION ARCHITECTURE
<p align="center"><img src="src/api/src/api/core/static/images/snapshots/metton-arch.webp"></p>

This project is currently in alpha stage. More components are continuosly being added or dropped as the need arises.

## DEV Setup

- Clone repo
- Run `cp env.example .env` and fill up details as desired
- Run `chmox +x ./.shell/python_entrypoint.sh`
- Run `docker-compose up --build -d --wait`
- Visit http://127.0.0.1:8080
- For local setup, you make use of the RabbitMQ and PostgreSQL docker images
- In production, we take advantage of AWS infrastrures by using MQ and RDS

## WORKFLOW
- The entire application is fully `containerised`. 
- For `scaling and efficiency` in PROD, I'm taking advangtage of AWS Managed Services for certain components like the Database and Message Queues. 
- For a complete overview of container services available on PROD, please check this file: `ecs-task-definition.json`
- While for a complete overview of container services available on DEV, please check the docker compose file: `docker-compose.yaml`
- `Nginx` acts as a reverse proxy; For Development, this is made possible through port 8080 on the Host machine & port 80 in the container. You can always configure or change this from your `.env` config
- `Nginx` also serves static contents & routes incoming requests to `Gunicorn`
- Django through `Gunicorn` serves the main app on port 8000. The `Python` container EXPOSES port 8000 for this purpose.
- `collectstatic` uses /var/www/static as static volume in PROD. But you don't have to worry about this during development, as Django would serve the assets directly from `src/api/core/static`
- `Python` and `Nginx` both share the same static volume
  <br>

## AWS Setup with Terraform
I've designed the follwing guidelines with AWS's Free Tier in mind. However, you're free to scale up the resources as needed depending on usage and requirements.

To use this Terraform configuration, you need to set up your AWS credentials and configuration files. Follow these steps:

1. **Create a `terraform.tfvars` file** in `.terraform` directory of this project, if it doesn't already exist.

2. **Define your AWS configuration and credentials paths** in the `terraform.tfvars` file. For example:

   ```hcl
   shared_config_files = ["/path/to/your/aws/config"]
   shared_credentials_files = ["/path/to/your/aws/credentials"]
   aws_region = "your-aws-region"
   profile = "your-credentials-profile-name"

   // add as many more credentials and variables in this file. 
   // please check .terraform/aws/variables.tf for a list of variables and credentials you MUST set up in this file. Without these values, terraform may not be able to create the required aws infrastructure
   ```

   Replace `/path/to/your/aws/config` and `/path/to/your/aws/credentials` with the actual paths to your AWS configuration and credentials files.

3. Store sensitive credentials stored in `.terraform/aws/terraform.tfvars`
4. For a list of required credentials, please check `.terraform/aws/variables.tf`

### BOOTSTRAPPING TERRAFORM ON AWS
###### 1. Create an AWS Account
  - Go to the AWS sign-up page and create a new account.

###### 2. Create a User for Terraform
- After logging into your AWS console, navigate to the IAM (Identity and Access Management) service.
- Go to Users and click on Add user.
- Enter a username for Terraform (e.g., terraform-user), and select Programmatic access.
- For Permissions, choose Attach existing policies directly, and select AdministratorAccess (you can refine scale down this permission later if needed). This grants Terraform the necessary permissions to create and manage AWS resources.

###### 3. Create Access Key and Secret
- Create access credentials (Access Key ID and Secret Access Key).
- Download and store these credentials securely on your machine (this is important as you won’t be able to retrieve the Secret Access Key again).
- Store them in a secure location (e.g., a password manager or encrypted file).

###### 4. Create an SSH Keypair for EC2 Access
- On your local machine, open a terminal and generate a new SSH keypair:
  ```
  ssh-keygen -t rsa -b 2048 -f ~/.ssh/metton_ec2
  ```
- Follow the prompts to set a passphrase (or leave it empty if you prefer).
- This will generate two files:
```
  metton_ec2 (private key)
  metton_ec2.pub (public key)
```
- Important: Store the private key securely, and make sure it is not shared or exposed.

###### 5. Reference the Public Key in Terraform Configuration
- In your terraform.tfvars, reference the public key for EC2:
```
ec2_key_pair_name = "~/.ssh/metton_ec2.pub"
```
##### LIST OF AWS RESOURCES & TERRFORM MODULES
```hcl
.terraform/aws 
├── compute/          # EC2, ECR
├── database/         # PostgreSQL
├── messaging/        # RabbitMQ
├── networking/       # Internet Gateway, Load Balancers, Route Table, Route 53, Subnet Group, Subnet, Cloud Map
├── storage/          # S3, EFS
├── security/         # SSL Cert Manager, Security Groups, Key Pairs, KMS, Parameter store, IAM
├── monitoring/        # Cloudwatch
```

### DELAYS & PROPAGATION 
##### Important Note:

When applying this Terraform configuration, you may experience delays during resource validation or propagation, especially with resources like ACM certificates and DNS updates. 

These processes may take some time to complete and may not immediately reflect in the Terraform output.

##### What to do:

If the validation fails or takes longer than expected, try running the process again after some time (waiting a few hours can sometimes help).

In case of recurring issues, verify that DNS records have been properly updated and propagated before retrying. I recommend being patient during these steps, as AWS and DNS updates can take time to fully propagate.

## UI Components
- Material UI
- Magic UI

<!-- ## And it comes with a beautiful User Interface you can customize or use straight out the box

#### Landing page

<p align="center"><img src="src/api/core/static/images/snapshots/home.png"></p>

#### All pages are responsive

<p align="center"><img src="src/api/core/static/images/snapshots/home-mobile-view.png"></p>

#### Booking page

<p align="center"><img src="src/api/core/static/images/snapshots/booking-page.png"></p>

#### Manage Schedules

<p align="center"><img src="src/api/core/static/images/snapshots/manage-schedules.png"></p>

#### Manage Appointments

<p align="center"><img src="src/api/core/static/images/snapshots/upcoming-appointments.png"></p> -->

## License

## License

[GNU AGPLv3”](LICENSE).
