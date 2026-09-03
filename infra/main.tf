terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

data "aws_vpc" "default" {
  default = true
}

# 1. Security Group for EC2 Server
resource "aws_security_group" "queue_ec2_sg" {
  name        = "queue-backend-sg"
  description = "Allow inbound traffic for Queue Backend"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 5001
    to_port     = 5001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 2. Security Group for RDS Database
resource "aws_security_group" "queue_rds_sg" {
  name        = "queue-db-sg"
  description = "Allow Postgres traffic from EC2"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.queue_ec2_sg.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. Free-Tier Managed PostgreSQL Database
resource "aws_db_instance" "queue_postgres" {
  identifier             = "queue-prod-db"
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = "db.t3.micro"
  username               = "queue_admin"
  password               = "SuperSecretQueuePassword2026!"
  vpc_security_group_ids = [aws_security_group.queue_rds_sg.id]
  publicly_accessible    = false
  skip_final_snapshot    = true
}

# 4. Fetch Latest Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# 5. Free-Tier EC2 Server
resource "aws_instance" "queue_backend" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  key_name               = "queue-prod-key"
  vpc_security_group_ids = [aws_security_group.queue_ec2_sg.id]

  tags = {
    Name = "Queue-Production-Server"
  }
}

# 6. Outputs
output "EC2_PUBLIC_IP" {
  value = aws_instance.queue_backend.public_ip
}
output "DATABASE_ENDPOINT" {
  value = aws_db_instance.queue_postgres.endpoint
}
