pipeline {
    agent any
    
    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
        ECR_REPOSITORY_BACKEND = 'newsbuddy-backend'
        ECR_REPOSITORY_FRONTEND = 'newsbuddy-frontend'
        EKS_CLUSTER_NAME = 'newsbuddy-cluster'
        KUBECONFIG = credentials('kubeconfig')
        AWS_CREDENTIALS = credentials('aws-credentials')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.BUILD_TAG = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm test -- --coverage --watchAll=false'
                        }
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'backend/coverage/lcov.info'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'CI=true npm test -- --coverage --watchAll=false'
                        }
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'frontend/coverage/lcov.info'
                        }
                    }
                }
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('Backend Lint') {
                    steps {
                        dir('backend') {
                            sh 'npm run lint'
                        }
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm run lint'
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    // Run npm audit for both frontend and backend
                    sh '''
                        cd backend && npm audit --audit-level moderate
                        cd ../frontend && npm audit --audit-level moderate
                    '''
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        script {
                            def backendImage = docker.build(
                                "${ECR_REGISTRY}/${ECR_REPOSITORY_BACKEND}:${BUILD_TAG}",
                                "./backend"
                            )
                            env.BACKEND_IMAGE = "${ECR_REGISTRY}/${ECR_REPOSITORY_BACKEND}:${BUILD_TAG}"
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        script {
                            def frontendImage = docker.build(
                                "${ECR_REGISTRY}/${ECR_REPOSITORY_FRONTEND}:${BUILD_TAG}",
                                "--build-arg REACT_APP_API_URL=https://api.newsbuddy.com/api --build-arg REACT_APP_WS_URL=wss://api.newsbuddy.com ./frontend"
                            )
                            env.FRONTEND_IMAGE = "${ECR_REGISTRY}/${ECR_REPOSITORY_FRONTEND}:${BUILD_TAG}"
                        }
                    }
                }
            }
        }
        
        stage('Push to ECR') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch 'staging'
                }
            }
            steps {
                script {
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-credentials']]) {
                        sh '''
                            aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
                            docker push $BACKEND_IMAGE
                            docker push $FRONTEND_IMAGE
                        '''
                    }
                }
            }
        }
        
        stage('Deploy to EKS') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch 'staging'
                }
            }
            steps {
                script {
                    def environment = env.BRANCH_NAME == 'main' ? 'production' : 
                                   env.BRANCH_NAME == 'staging' ? 'staging' : 'development'
                    
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-credentials']]) {
                        sh '''
                            aws eks update-kubeconfig --region $AWS_DEFAULT_REGION --name $EKS_CLUSTER_NAME
                            
                            # Update deployment images
                            kubectl set image deployment/newsbuddy-backend newsbuddy-backend=$BACKEND_IMAGE -n newsbuddy-$ENVIRONMENT
                            kubectl set image deployment/newsbuddy-frontend newsbuddy-frontend=$FRONTEND_IMAGE -n newsbuddy-$ENVIRONMENT
                            
                            # Wait for rollout to complete
                            kubectl rollout status deployment/newsbuddy-backend -n newsbuddy-$ENVIRONMENT --timeout=300s
                            kubectl rollout status deployment/newsbuddy-frontend -n newsbuddy-$ENVIRONMENT --timeout=300s
                        '''
                    }
                }
            }
        }
        
        stage('Integration Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch 'staging'
                }
            }
            steps {
                script {
                    def environment = env.BRANCH_NAME == 'main' ? 'production' : 
                                   env.BRANCH_NAME == 'staging' ? 'staging' : 'development'
                    
                    sh '''
                        # Wait for services to be ready
                        sleep 30
                        
                        # Run integration tests
                        cd backend
                        npm run test:integration -- --env=$ENVIRONMENT
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // Clean up Docker images
            sh '''
                docker image prune -f
                docker system prune -f
            '''
        }
        
        success {
            script {
                if (env.BRANCH_NAME == 'main') {
                    slackSend(
                        channel: '#deployments',
                        color: 'good',
                        message: "✅ NewsBuddy deployment successful! Version: ${BUILD_TAG}"
                    )
                }
            }
        }
        
        failure {
            script {
                slackSend(
                    channel: '#deployments',
                    color: 'danger',
                    message: "❌ NewsBuddy deployment failed! Branch: ${env.BRANCH_NAME}, Build: ${env.BUILD_NUMBER}"
                )
            }
        }
        
        unstable {
            script {
                slackSend(
                    channel: '#deployments',
                    color: 'warning',
                    message: "⚠️ NewsBuddy deployment unstable! Branch: ${env.BRANCH_NAME}, Build: ${env.BUILD_NUMBER}"
                )
            }
        }
    }
}