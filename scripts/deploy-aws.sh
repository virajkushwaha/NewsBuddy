#!/bin/bash

# AWS EKS Deployment Script for NewsBuddy
set -e

# Configuration
CLUSTER_NAME="newsbuddy-cluster"
REGION="us-east-1"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
BACKEND_REPO="newsbuddy-backend"
FRONTEND_REPO="newsbuddy-frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting NewsBuddy AWS EKS Deployment${NC}"

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed${NC}"
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}❌ kubectl is not installed${NC}"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Create ECR repositories
create_ecr_repos() {
    echo -e "${YELLOW}Creating ECR repositories...${NC}"
    
    aws ecr create-repository --repository-name $BACKEND_REPO --region $REGION || true
    aws ecr create-repository --repository-name $FRONTEND_REPO --region $REGION || true
    
    echo -e "${GREEN}✅ ECR repositories created${NC}"
}

# Build and push Docker images
build_and_push() {
    echo -e "${YELLOW}Building and pushing Docker images...${NC}"
    
    # Get ECR login token
    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
    
    # Build and push backend
    echo -e "${YELLOW}Building backend image...${NC}"
    docker build -t $ECR_REGISTRY/$BACKEND_REPO:latest ./backend
    docker push $ECR_REGISTRY/$BACKEND_REPO:latest
    
    # Build and push frontend
    echo -e "${YELLOW}Building frontend image...${NC}"
    docker build -t $ECR_REGISTRY/$FRONTEND_REPO:latest \
        --build-arg REACT_APP_API_URL=https://api.newsbuddy.com/api \
        --build-arg REACT_APP_WS_URL=wss://api.newsbuddy.com \
        ./frontend
    docker push $ECR_REGISTRY/$FRONTEND_REPO:latest
    
    echo -e "${GREEN}✅ Images built and pushed${NC}"
}

# Deploy EKS cluster using CloudFormation
deploy_eks_cluster() {
    echo -e "${YELLOW}Deploying EKS cluster...${NC}"
    
    aws cloudformation deploy \
        --template-file aws/cloudformation/eks-cluster.yaml \
        --stack-name newsbuddy-eks \
        --capabilities CAPABILITY_IAM \
        --region $REGION \
        --parameter-overrides \
            ClusterName=$CLUSTER_NAME
    
    echo -e "${GREEN}✅ EKS cluster deployed${NC}"
}

# Update kubeconfig
update_kubeconfig() {
    echo -e "${YELLOW}Updating kubeconfig...${NC}"
    
    aws eks update-kubeconfig --region $REGION --name $CLUSTER_NAME
    
    echo -e "${GREEN}✅ Kubeconfig updated${NC}"
}

# Deploy Kubernetes resources
deploy_k8s_resources() {
    echo -e "${YELLOW}Deploying Kubernetes resources...${NC}"
    
    # Update image references in deployment files
    sed -i "s|YOUR_ECR_REGISTRY|$ECR_REGISTRY|g" k8s/backend-deployment.yaml
    sed -i "s|YOUR_ECR_REGISTRY|$ECR_REGISTRY|g" k8s/frontend-deployment.yaml
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secrets.yaml
    kubectl apply -f k8s/backend-deployment.yaml
    kubectl apply -f k8s/frontend-deployment.yaml
    kubectl apply -f k8s/ingress.yaml
    
    echo -e "${GREEN}✅ Kubernetes resources deployed${NC}"
}

# Wait for deployments to be ready
wait_for_deployments() {
    echo -e "${YELLOW}Waiting for deployments to be ready...${NC}"
    
    kubectl wait --for=condition=available --timeout=300s deployment/newsbuddy-backend -n newsbuddy-production
    kubectl wait --for=condition=available --timeout=300s deployment/newsbuddy-frontend -n newsbuddy-production
    
    echo -e "${GREEN}✅ Deployments are ready${NC}"
}

# Get service URLs
get_service_urls() {
    echo -e "${YELLOW}Getting service URLs...${NC}"
    
    INGRESS_URL=$(kubectl get ingress newsbuddy-ingress -n newsbuddy-production -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo -e "${GREEN}🌐 Application URL: https://$INGRESS_URL${NC}"
    echo -e "${GREEN}📊 Kubernetes Dashboard: kubectl proxy${NC}"
}

# Main execution
main() {
    check_prerequisites
    create_ecr_repos
    build_and_push
    deploy_eks_cluster
    update_kubeconfig
    deploy_k8s_resources
    wait_for_deployments
    get_service_urls
    
    echo -e "${GREEN}🎉 NewsBuddy has been successfully deployed to AWS EKS!${NC}"
}

# Run main function
main "$@"