#!/usr/bin/env python3
import boto3
import base64
import json
import os

# AWS clients with explicit region
region = os.environ.get('AWS_DEFAULT_REGION', 'us-east-1')
ec2 = boto3.client('ec2', region_name=region)
elbv2 = boto3.client('elbv2', region_name=region)

def create_key_pair():
    try:
        response = ec2.create_key_pair(KeyName='newsbuddy-key')
        with open('newsbuddy-key.pem', 'w') as f:
            f.write(response['KeyMaterial'])
        print("✅ Key pair created: newsbuddy-key")
        return 'newsbuddy-key'
    except:
        print("✅ Key pair already exists")
        return 'newsbuddy-key'

def create_security_group():
    try:
        vpc_response = ec2.describe_vpcs(Filters=[{'Name': 'isDefault', 'Values': ['true']}])
        vpc_id = vpc_response['Vpcs'][0]['VpcId']
        
        sg_response = ec2.create_security_group(
            GroupName='newsbuddy-sg',
            Description='Security group for NewsBuddy',
            VpcId=vpc_id
        )
        sg_id = sg_response['GroupId']
        
        # Inbound rules - restrict SSH to your IP
        ec2.authorize_security_group_ingress(
            GroupId=sg_id,
            IpPermissions=[
                {'IpProtocol': 'tcp', 'FromPort': 22, 'ToPort': 22, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
                {'IpProtocol': 'tcp', 'FromPort': 22, 'ToPort': 22, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
                {'IpProtocol': 'tcp', 'FromPort': 80, 'ToPort': 80, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
                {'IpProtocol': 'tcp', 'FromPort': 5000, 'ToPort': 5000, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]}
            ]
        )
        
        # Outbound rules (anywhere)
        ec2.authorize_security_group_egress(
            GroupId=sg_id,
            IpPermissions=[
                {'IpProtocol': '-1', 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]}
            ]
        )
        
        print(f"✅ Security group created: {sg_id}")
        return sg_id
    except Exception as e:
        # Get existing security group
        sgs = ec2.describe_security_groups(Filters=[{'Name': 'group-name', 'Values': ['newsbuddy-sg']}])
        if sgs['SecurityGroups']:
            print("✅ Security group already exists")
            return sgs['SecurityGroups'][0]['GroupId']
        raise e

def get_userdata_script():
    return base64.b64encode("""#!/bin/bash
yum update -y
yum install -y docker git curl

# Start Docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose v2
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Clone repository
cd /home/ec2-user
git clone https://github.com/virajkushwaha/NewsBuddy.git
cd NewsBuddy

# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Create environment files
cat > backend/.env << EOF
NEWS_API_KEY=79571b9c95fa40fd81389f6f6e79ea6d
NEWSDATA_API_KEY=pub_bc7c0eb9ffb14c9badbce36ba8439fba
AWS_REGION=us-east-1
MONGODB_URI=mongodb://mongodb:27017/newsbuddy
JWT_SECRET=$JWT_SECRET
PORT=5000
EOF

cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
EOF

# Create docker-compose override with MongoDB
cat > docker-compose.override.yml << EOF
version: '3.8'
services:
  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: newsbuddy
  frontend:
    ports:
      - "80:80"
    depends_on:
      - backend
  backend:
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/newsbuddy
volumes:
  mongodb_data:
EOF

# Build and run containers with error handling
set -e
docker-compose up -d --build || exit 1

# Set ownership
chown -R ec2-user:ec2-user /home/ec2-user/NewsBuddy
""".encode()).decode()

def create_ec2_instance(key_name, sg_id):
    userdata = get_userdata_script()
    
    response = ec2.run_instances(
        ImageId='ami-0c02fb55956c7d316',  # Amazon Linux 2023
        MinCount=1,
        MaxCount=1,
        InstanceType='t2.medium',
        KeyName=key_name,
        SecurityGroupIds=[sg_id],
        UserData=userdata,
        BlockDeviceMappings=[{
            'DeviceName': '/dev/xvda',
            'Ebs': {
                'VolumeSize': 20,
                'VolumeType': 'gp2',
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
    
    # Create frontend target group
    frontend_tg = elbv2.create_target_group(
        Name='newsbuddy-frontend-tg',
        Protocol='HTTP',
        Port=80,
        VpcId=vpc_id,
        TargetType='instance',
        HealthCheckPath='/',
        HealthCheckIntervalSeconds=30,
        HealthCheckTimeoutSeconds=5,
        HealthyThresholdCount=2,
        UnhealthyThresholdCount=3
    )
    frontend_tg_arn = frontend_tg['TargetGroups'][0]['TargetGroupArn']
    
    # Create backend target group
    backend_tg = elbv2.create_target_group(
        Name='newsbuddy-backend-tg',
        Protocol='HTTP',
        Port=5000,
        VpcId=vpc_id,
        TargetType='instance',
        HealthCheckPath='/health',
        HealthCheckIntervalSeconds=30,
        HealthCheckTimeoutSeconds=5,
        HealthyThresholdCount=2,
        UnhealthyThresholdCount=3
    )
    backend_tg_arn = backend_tg['TargetGroups'][0]['TargetGroupArn']
    
    # Register instances
    elbv2.register_targets(
        TargetGroupArn=frontend_tg_arn,
        Targets=[{'Id': instance_id, 'Port': 80}]
    )
    elbv2.register_targets(
        TargetGroupArn=backend_tg_arn,
        Targets=[{'Id': instance_id, 'Port': 5000}]
    )
    
    # Create listener with rules
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
        # Create resources
        key_name = create_key_pair()
        sg_id = create_security_group()
        instance_id, public_ip = create_ec2_instance(key_name, sg_id)
        alb_dns = create_alb(sg_id, instance_id)
        
        print("\n🎉 Deployment completed!")
        print(f"Instance IP: {public_ip}")
        print(f"ALB DNS: {alb_dns}")
        print(f"Frontend URL: http://{alb_dns}")
        print(f"Backend URL: http://{public_ip}:5000")
        print(f"SSH: ssh -i newsbuddy-key.pem ec2-user@{public_ip}")
        
    except Exception as e:
        print(f"❌ Deployment failed: {str(e)}")
        print("Please check AWS credentials and permissions.")
        raise

if __name__ == "__main__":
    main()