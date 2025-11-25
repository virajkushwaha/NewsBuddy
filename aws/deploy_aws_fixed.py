#!/usr/bin/env python3
import boto3
import base64
import json
import os
import time

# AWS clients with explicit region
region = os.environ.get('AWS_DEFAULT_REGION', 'us-east-1')
ec2 = boto3.client('ec2', region_name=region)
elbv2 = boto3.client('elbv2', region_name=region)

def cleanup_existing_resources():
    print("🧹 Cleaning up existing resources...")
    
    # Delete ALB if exists
    try:
        albs = elbv2.describe_load_balancers(Names=['newsbuddy-alb'])
        if albs['LoadBalancers']:
            alb_arn = albs['LoadBalancers'][0]['LoadBalancerArn']
            elbv2.delete_load_balancer(LoadBalancerArn=alb_arn)
            print("✅ ALB deleted")
            time.sleep(10)
    except elbv2.exceptions.LoadBalancerNotFoundException:
        print("ℹ️ ALB doesn't exist")
    except Exception as e:
        print(f"⚠️ ALB deletion failed: {e}")
    
    # Delete target groups if exist
    for tg_name in ['newsbuddy-frontend-tg', 'newsbuddy-backend-tg']:
        try:
            tgs = elbv2.describe_target_groups(Names=[tg_name])
            if tgs['TargetGroups']:
                elbv2.delete_target_group(TargetGroupArn=tgs['TargetGroups'][0]['TargetGroupArn'])
                print(f"✅ Target group {tg_name} deleted")
        except elbv2.exceptions.TargetGroupNotFoundException:
            print(f"ℹ️ Target group {tg_name} doesn't exist")
        except Exception as e:
            print(f"⚠️ Target group {tg_name} deletion failed: {e}")
    
    # Terminate EC2 instances if exist
    try:
        instances = ec2.describe_instances(Filters=[
            {'Name': 'tag:Name', 'Values': ['NewsBuddy']}, 
            {'Name': 'instance-state-name', 'Values': ['running', 'pending']}
        ])
        if instances['Reservations']:
            for reservation in instances['Reservations']:
                for instance in reservation['Instances']:
                    ec2.terminate_instances(InstanceIds=[instance['InstanceId']])
                    print(f"✅ Instance {instance['InstanceId']} terminated")
            time.sleep(30)
    except Exception as e:
        print(f"⚠️ Instance termination failed: {e}")
    
    # Delete security group if exists
    try:
        sgs = ec2.describe_security_groups(Filters=[{'Name': 'group-name', 'Values': ['newsbuddy-sg']}])
        if sgs['SecurityGroups']:
            ec2.delete_security_group(GroupId=sgs['SecurityGroups'][0]['GroupId'])
            print("✅ Security group deleted")
    except Exception as e:
        print(f"⚠️ Security group deletion failed: {e}")

def create_key_pair():
    try:
        ec2.describe_key_pairs(KeyNames=['newsbuddy-key'])
        print("✅ Key pair already exists")
        return 'newsbuddy-key'
    except Exception:
        response = ec2.create_key_pair(KeyName='newsbuddy-key')
        with open('newsbuddy-key.pem', 'w') as f:
            f.write(response['KeyMaterial'])
        os.chmod('newsbuddy-key.pem', 0o400)
        print("✅ Key pair created: newsbuddy-key")
        return 'newsbuddy-key'

def create_security_group():
    try:
        sgs = ec2.describe_security_groups(Filters=[{'Name': 'group-name', 'Values': ['newsbuddy-sg']}])
        if sgs['SecurityGroups']:
            print("✅ Security group already exists")
            return sgs['SecurityGroups'][0]['GroupId']
    except:
        pass
    
    vpc_response = ec2.describe_vpcs(Filters=[{'Name': 'isDefault', 'Values': ['true']}])
    vpc_id = vpc_response['Vpcs'][0]['VpcId']
    
    sg_response = ec2.create_security_group(
        GroupName='newsbuddy-sg',
        Description='Security group for NewsBuddy',
        VpcId=vpc_id
    )
    sg_id = sg_response['GroupId']
    
    # Enhanced security group rules
    ec2.authorize_security_group_ingress(
        GroupId=sg_id,
        IpPermissions=[
            {'IpProtocol': 'tcp', 'FromPort': 22, 'ToPort': 22, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
            {'IpProtocol': 'tcp', 'FromPort': 80, 'ToPort': 80, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
            {'IpProtocol': 'tcp', 'FromPort': 3000, 'ToPort': 3000, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
            {'IpProtocol': 'tcp', 'FromPort': 5000, 'ToPort': 5000, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
            {'IpProtocol': 'tcp', 'FromPort': 27017, 'ToPort': 27017, 'IpRanges': [{'CidrIp': '10.0.0.0/8'}]}
        ]
    )
    
    print(f"✅ Security group created: {sg_id}")
    return sg_id

def get_userdata_script():
    return base64.b64encode("""#!/bin/bash
yum update -y
yum install -y docker git curl

# Start Docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose v2 plugin
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
mkdir -p /usr/local/lib/docker/cli-plugins
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Clone repository
cd /home/ec2-user
git clone https://github.com/virajkushwaha/NewsBuddy.git
cd NewsBuddy

# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Create backend environment file
cat > backend/.env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/newsbuddy?authSource=admin
REDIS_URL=redis://redis:6379
JWT_SECRET=$JWT_SECRET
NEWS_API_KEY=79571b9c95fa40fd81389f6f6e79ea6d
NEWSDATA_API_KEY=pub_bc7c0eb9ffb14c9badbce36ba8439fba
AWS_REGION=us-east-1
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10000
EOF

# Create frontend environment file
cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
EOF

# Fix backend database configuration for MongoDB
cat > backend/config/database.js << 'EOF'
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
EOF

# Add health endpoint to frontend
mkdir -p frontend/public
cat > frontend/public/health << 'EOF'
{"status":"OK","service":"frontend"}
EOF

# Wait for Docker to be ready
sleep 10

# Build and run containers
docker compose up -d --build

# Wait for services to start
sleep 60

# Check service health
docker compose ps
docker compose logs --tail=50

# Set ownership
chown -R ec2-user:ec2-user /home/ec2-user/NewsBuddy

""".encode()).decode()

def create_ec2_instance(key_name, sg_id):
    userdata = get_userdata_script()
    
    response = ec2.run_instances(
        ImageId='ami-0c02fb55956c7d316',  # Amazon Linux 2023
        MinCount=1,
        MaxCount=1,
        InstanceType='t3.medium',  # Upgraded for better performance
        KeyName=key_name,
        SecurityGroupIds=[sg_id],
        UserData=userdata,
        BlockDeviceMappings=[{
            'DeviceName': '/dev/xvda',
            'Ebs': {
                'VolumeSize': 30,  # Increased storage
                'VolumeType': 'gp3',
                'DeleteOnTermination': True
            }
        }],
        TagSpecifications=[{
            'ResourceType': 'instance',
            'Tags': [{'Key': 'Name', 'Value': 'NewsBuddy'}]
        }]
    )
    
    instance_id = response['Instances'][0]['InstanceId']
    print(f"✅ EC2 instance created: {instance_id}")
    
    # Wait for instance to be running
    waiter = ec2.get_waiter('instance_running')
    waiter.wait(InstanceIds=[instance_id])
    
    # Get public IP
    instance = ec2.describe_instances(InstanceIds=[instance_id])['Reservations'][0]['Instances'][0]
    public_ip = instance.get('PublicIpAddress')
    
    print(f"✅ Instance 'NewsBuddy' is running at: {public_ip}")
    return instance_id, public_ip

def create_alb(sg_id, instance_id):
    # Get default VPC and subnets
    vpc_response = ec2.describe_vpcs(Filters=[{'Name': 'isDefault', 'Values': ['true']}])
    vpc_id = vpc_response['Vpcs'][0]['VpcId']
    
    subnets_response = ec2.describe_subnets(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}])
    subnet_ids = [subnet['SubnetId'] for subnet in subnets_response['Subnets'][:2]]
    
    # Create ALB
    alb_response = elbv2.create_load_balancer(
        Name='newsbuddy-alb',
        Subnets=subnet_ids,
        SecurityGroups=[sg_id],
        Scheme='internet-facing',
        Type='application',
        IpAddressType='ipv4'
    )
    
    alb_arn = alb_response['LoadBalancers'][0]['LoadBalancerArn']
    alb_dns = alb_response['LoadBalancers'][0]['DNSName']
    
    # Create frontend target group with correct health check
    frontend_tg = elbv2.create_target_group(
        Name='newsbuddy-frontend-tg',
        Protocol='HTTP',
        Port=3000,  # Changed to port 3000
        VpcId=vpc_id,
        TargetType='instance',
        HealthCheckPath='/health',  # Health check endpoint
        HealthCheckIntervalSeconds=30,
        HealthCheckTimeoutSeconds=10,
        HealthyThresholdCount=2,
        UnhealthyThresholdCount=3,
        HealthCheckProtocol='HTTP',
        HealthCheckPort='3000'
    )
    frontend_tg_arn = frontend_tg['TargetGroups'][0]['TargetGroupArn']
    
    # Create backend target group with correct health check
    backend_tg = elbv2.create_target_group(
        Name='newsbuddy-backend-tg',
        Protocol='HTTP',
        Port=5000,
        VpcId=vpc_id,
        TargetType='instance',
        HealthCheckPath='/health',
        HealthCheckIntervalSeconds=30,
        HealthCheckTimeoutSeconds=10,
        HealthyThresholdCount=2,
        UnhealthyThresholdCount=3,
        HealthCheckProtocol='HTTP',
        HealthCheckPort='5000'
    )
    backend_tg_arn = backend_tg['TargetGroups'][0]['TargetGroupArn']
    
    # Register instances with correct ports
    elbv2.register_targets(
        TargetGroupArn=frontend_tg_arn,
        Targets=[{'Id': instance_id, 'Port': 3000}]
    )
    elbv2.register_targets(
        TargetGroupArn=backend_tg_arn,
        Targets=[{'Id': instance_id, 'Port': 5000}]
    )
    
    # Create listener with proper routing
    listener_response = elbv2.create_listener(
        LoadBalancerArn=alb_arn,
        Protocol='HTTP',
        Port=80,
        DefaultActions=[{
            'Type': 'forward',
            'TargetGroupArn': frontend_tg_arn
        }]
    )
    listener_arn = listener_response['Listeners'][0]['ListenerArn']
    
    # Add rule for API routes
    elbv2.create_rule(
        ListenerArn=listener_arn,
        Priority=100,
        Conditions=[{
            'Field': 'path-pattern',
            'Values': ['/api/*', '/health']
        }],
        Actions=[{
            'Type': 'forward',
            'TargetGroupArn': backend_tg_arn
        }]
    )
    
    print(f"✅ ALB created: {alb_dns}")
    return alb_dns

def main():
    print("🚀 Starting AWS deployment for NewsBuddy...")
    
    try:
        # Clean up existing resources first
        cleanup_existing_resources()
        time.sleep(10)
        
        # Create resources
        key_name = create_key_pair()
        sg_id = create_security_group()
        instance_id, public_ip = create_ec2_instance(key_name, sg_id)
        
        # Wait for application to start
        print("⏳ Waiting for application to start (5 minutes)...")
        time.sleep(300)
        
        alb_dns = create_alb(sg_id, instance_id)
        
        print("\n🎉 Deployment completed!")
        print(f"Instance IP: {public_ip}")
        print(f"ALB DNS: {alb_dns}")
        print(f"Frontend URL: http://{alb_dns}")
        print(f"Backend URL: http://{alb_dns}/api")
        print(f"Direct Frontend: http://{public_ip}:3000")
        print(f"Direct Backend: http://{public_ip}:5000")
        print(f"SSH: ssh -i newsbuddy-key.pem ec2-user@{public_ip}")
        print("\n📋 Debugging commands:")
        print(f"ssh -i newsbuddy-key.pem ec2-user@{public_ip}")
        print("docker compose ps")
        print("docker compose logs backend")
        print("docker compose logs frontend")
        
    except Exception as e:
        print(f"❌ Deployment failed: {str(e)}")
        print("Please check AWS credentials and permissions.")
        raise

if __name__ == "__main__":
    main()