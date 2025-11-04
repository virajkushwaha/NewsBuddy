# NewsBuddy - AI-Powered Personalized News Feed

A complete full-stack AI-powered news platform with personalized recommendations, semantic search, and multi-environment deployment support.

## 🚀 Features

- **AI-Powered Personalization**: ML-based news recommendations using Amazon SageMaker + Bedrock embeddings
- **Dual API Integration**: NewsAPI.org primary with NewsData.io fallback
- **Semantic Search**: OpenSearch backend for intelligent content discovery
- **Modern UI**: React.js with dark/light mode, infinite scrolling
- **Real-time Updates**: Live news feed with personalized content
- **Multi-Environment**: Local Windows, Docker Ubuntu, AWS EKS deployment

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Docker Desktop (for containerization)
- AWS CLI configured (for cloud deployment)
- Git

## 🛠️ Local Windows Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd NewsBuddy

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update the `.env` files with your API keys:

**Backend (.env):**
```
NEWS_API_KEY=79571b9c95fa40fd81389f6f6e79ea6d
NEWSDATA_API_KEY=pub_bc7c0eb9ffb14c9badbce36ba8439fba
AWS_REGION=us-east-1
MONGODB_URI=mongodb://localhost:27017/newsbuddy
JWT_SECRET=your-jwt-secret
OPENSEARCH_ENDPOINT=https://your-opensearch-domain
```

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
```

### 3. Start Services

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm start
```

Access the application at `http://localhost:3000`

## 🐳 Docker Deployment

### Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Individual Container Build

```bash
# Build backend
docker build -t newsbuddy-backend ./backend

# Build frontend
docker build -t newsbuddy-frontend ./frontend

# Run containers
docker run -p 5000:5000 newsbuddy-backend
docker run -p 3000:3000 newsbuddy-frontend
```

## ☁️ AWS EKS Deployment

### Prerequisites
- AWS CLI configured
- kubectl installed
- eksctl installed

### 1. Create EKS Cluster

```bash
# Create cluster using CloudFormation
aws cloudformation create-stack \
  --stack-name newsbuddy-eks \
  --template-body file://aws/cloudformation/eks-cluster.yaml \
  --capabilities CAPABILITY_IAM

# Or use eksctl
eksctl create cluster --name newsbuddy --region us-east-1
```

### 2. Deploy Application

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n newsbuddy
```

## 🔧 Jenkins CI/CD Pipeline

### Setup Jenkins Pipeline

1. Create multibranch pipeline in Jenkins
2. Point to this repository
3. Jenkins will automatically detect `Jenkinsfile`
4. Configure AWS credentials in Jenkins

### Pipeline Stages

- **Build**: Install dependencies, run tests
- **Docker**: Build and push images to ECR
- **Deploy**: Deploy to EKS cluster
- **Test**: Run integration tests

## 📊 Monitoring & Logging

### Local Development
- Backend logs: `backend/logs/`
- Frontend console: Browser DevTools

### Production (AWS)
- CloudWatch Logs
- X-Ray tracing
- Custom metrics dashboard

## 🔒 Security

- API keys stored in AWS Secrets Manager
- JWT authentication
- CORS configuration
- Input validation and sanitization

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📱 API Documentation

API documentation available at `http://localhost:5000/api-docs` when running locally.

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `.env` files
2. **API rate limits**: Check API key quotas
3. **Docker issues**: Ensure Docker Desktop is running
4. **AWS permissions**: Verify IAM roles and policies

### Debug Mode

```bash
# Backend debug
cd backend
npm run debug

# Frontend debug
cd frontend
REACT_APP_DEBUG=true npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 📞 Support

For issues and questions:
- Create GitHub issue
- Check troubleshooting section
- Review logs for error details