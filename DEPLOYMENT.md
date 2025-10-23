# NewsBuddy Deployment Guide

This guide covers deployment of NewsBuddy across different environments: Local Windows, Docker, and AWS EKS.

## 🖥️ Local Windows Development

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)
- Git

### Quick Start
1. Run the setup script:
   ```cmd
   scripts\setup-local.bat
   ```

2. Configure environment variables:
   - Update `backend\.env` with your API keys and database URL
   - Update `frontend\.env` with your API endpoint

3. Start development servers:
   ```cmd
   scripts\start-dev.bat
   ```

### Manual Setup
```cmd
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start backend (Terminal 1)
cd backend
npm run dev

# Start frontend (Terminal 2)
cd frontend
npm start
```

Access the application at `http://localhost:3000`

## 🐳 Docker Deployment

### Prerequisites
- Docker Desktop
- Docker Compose

### Quick Start
```cmd
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Container Build
```cmd
# Build backend
docker build -t newsbuddy-backend ./backend

# Build frontend
docker build -t newsbuddy-frontend ./frontend

# Run containers
docker run -p 5000:5000 newsbuddy-backend
docker run -p 3000:80 newsbuddy-frontend
```

### Services Included
- **MongoDB**: Database on port 27017
- **Redis**: Cache on port 6379
- **Backend**: API server on port 5000
- **Frontend**: React app on port 3000
- **Nginx**: Reverse proxy on port 80

## ☁️ AWS EKS Deployment

### Prerequisites
- AWS CLI configured
- kubectl installed
- Docker installed
- eksctl (optional)

### Environment Setup
```bash
export AWS_ACCOUNT_ID=your-account-id
export AWS_REGION=us-east-1
```

### Automated Deployment
```bash
# Make script executable
chmod +x scripts/deploy-aws.sh

# Run deployment
./scripts/deploy-aws.sh
```

### Manual Deployment Steps

#### 1. Create EKS Cluster
```bash
# Using CloudFormation
aws cloudformation create-stack \
  --stack-name newsbuddy-eks \
  --template-body file://aws/cloudformation/eks-cluster.yaml \
  --capabilities CAPABILITY_IAM

# Or using eksctl
eksctl create cluster --name newsbuddy-cluster --region us-east-1
```

#### 2. Create ECR Repositories
```bash
aws ecr create-repository --repository-name newsbuddy-backend
aws ecr create-repository --repository-name newsbuddy-frontend
```

#### 3. Build and Push Images
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/newsbuddy-backend:latest ./backend
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/newsbuddy-backend:latest

# Build and push frontend
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/newsbuddy-frontend:latest ./frontend
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/newsbuddy-frontend:latest
```

#### 4. Update Kubeconfig
```bash
aws eks update-kubeconfig --region us-east-1 --name newsbuddy-cluster
```

#### 5. Deploy to Kubernetes
```bash
# Update image references in deployment files
sed -i "s|YOUR_ECR_REGISTRY|$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com|g" k8s/*.yaml

# Apply manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

#### 6. Verify Deployment
```bash
# Check pods
kubectl get pods -n newsbuddy-production

# Check services
kubectl get services -n newsbuddy-production

# Check ingress
kubectl get ingress -n newsbuddy-production
```

## 🔧 Jenkins CI/CD Pipeline

### Setup Jenkins Pipeline
1. Create multibranch pipeline in Jenkins
2. Point to your Git repository
3. Configure AWS credentials in Jenkins
4. Set up webhook for automatic builds

### Pipeline Features
- **Build**: Install dependencies, run tests
- **Security**: npm audit, code scanning
- **Docker**: Build and push to ECR
- **Deploy**: Deploy to EKS cluster
- **Test**: Run integration tests
- **Notify**: Slack notifications

### Environment Branches
- `main` → Production deployment
- `staging` → Staging deployment  
- `develop` → Development deployment

## 📊 Monitoring & Logging

### Local Development
- Backend logs: `backend/logs/`
- Frontend: Browser DevTools

### Docker
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Monitor resources
docker stats
```

### AWS EKS
```bash
# Pod logs
kubectl logs -f deployment/newsbuddy-backend -n newsbuddy-production

# Cluster info
kubectl cluster-info

# Resource usage
kubectl top nodes
kubectl top pods -n newsbuddy-production
```

### AWS CloudWatch
- Application logs automatically sent to CloudWatch
- Custom metrics and dashboards available
- Set up alarms for critical metrics

## 🔒 Security Considerations

### API Keys Management
- Use AWS Secrets Manager in production
- Never commit secrets to Git
- Rotate keys regularly

### Network Security
- VPC with private subnets for EKS nodes
- Security groups with minimal required access
- WAF for web application firewall

### Container Security
- Non-root user in containers
- Minimal base images
- Regular security updates

## 🚨 Troubleshooting

### Common Issues

#### Local Development
```cmd
# Port conflicts
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Clear npm cache
npm cache clean --force

# Reset node_modules
rmdir /s node_modules
npm install
```

#### Docker Issues
```bash
# Clean up Docker
docker system prune -f
docker volume prune -f

# Rebuild without cache
docker-compose build --no-cache

# Check container logs
docker-compose logs backend
```

#### Kubernetes Issues
```bash
# Check pod status
kubectl describe pod <pod-name> -n newsbuddy-production

# Check events
kubectl get events -n newsbuddy-production --sort-by='.lastTimestamp'

# Restart deployment
kubectl rollout restart deployment/newsbuddy-backend -n newsbuddy-production
```

### Health Checks
- Backend: `http://localhost:5000/health`
- Frontend: `http://localhost:3000/health`
- Kubernetes: Built-in liveness/readiness probes

## 📞 Support

For deployment issues:
1. Check logs first
2. Verify environment variables
3. Ensure all prerequisites are installed
4. Check network connectivity
5. Review AWS IAM permissions (for EKS)

## 🔄 Updates & Rollbacks

### Rolling Updates
```bash
# Update image
kubectl set image deployment/newsbuddy-backend newsbuddy-backend=new-image:tag -n newsbuddy-production

# Check rollout status
kubectl rollout status deployment/newsbuddy-backend -n newsbuddy-production
```

### Rollbacks
```bash
# Rollback to previous version
kubectl rollout undo deployment/newsbuddy-backend -n newsbuddy-production

# Rollback to specific revision
kubectl rollout undo deployment/newsbuddy-backend --to-revision=2 -n newsbuddy-production
```