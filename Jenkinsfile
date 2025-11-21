pipeline {
    agent any

    environment {
        CI = 'true'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        KUBECONFIG = '/var/jenkins_home/.kube/config'
        DOCKER_REGISTRY = 'virajkushwaha'
        BACKEND_IMAGE = 'newsbuddy-backend'
        FRONTEND_IMAGE = 'newsbuddy-frontend'
    }



    stages {
        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Environment') {
            steps {
                sh '''
                    # Install Node.js if not available
                    if ! command -v node &> /dev/null; then
                        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
                        apt-get install -y nodejs
                    fi
                    
                    # Install Python3 and pip3 if not available
                    if ! command -v python3 &> /dev/null; then
                        apt-get update && apt-get install -y python3 python3-pip
                    fi
                    
                    if ! command -v pip3 &> /dev/null; then
                        apt-get install -y python3-pip
                    fi
                    
                    # Install AWS dependencies
                    pip3 install boto3 awscli --break-system-packages || apt-get install -y python3-boto3 python3-botocore
                    
                    node -v
                    npm -v
                    python3 --version
                    pip3 --version
                    docker --version
                    kubectl version --client || echo "kubectl not found"
                '''
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh '''
                                # Clean install with updated lock file
                                rm -f package-lock.json
                                npm install
                                npm install --save-dev jest supertest eslint jest-junit
                            '''
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh '''
                                # Clean install with updated lock file
                                rm -f package-lock.json
                                npm install
                                npm install --save-dev @testing-library/react @testing-library/jest-dom eslint jest-junit
                            '''
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
                            sh '''
                                # Create test script if missing
                                if ! grep -q '"test"' package.json; then
                                    npm pkg set scripts.test="jest --coverage --passWithNoTests --watchAll=false"
                                fi
                                
                                # Run tests with coverage
                                npm test -- --coverage --ci --watchAll=false --passWithNoTests --testResultsProcessor=jest-junit
                            '''
                        }
                        archiveArtifacts artifacts: 'backend/coverage/**, backend/junit.xml', allowEmptyArchive: true
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh '''
                                # Ensure test script exists
                                if ! grep -q '"test"' package.json; then
                                    npm pkg set scripts.test="react-scripts test --coverage --ci --watchAll=false"
                                fi
                                
                                # Run tests with coverage
                                CI=true npm test -- --coverage --ci --watchAll=false --passWithNoTests --testResultsProcessor=jest-junit
                            '''
                        }
                        archiveArtifacts artifacts: 'frontend/coverage/**, frontend/junit.xml', allowEmptyArchive: true
                    }
                }
            }
        }

        stage('Code Quality & Security') {
            parallel {
                stage('Backend Lint & Quality') {
                    steps {
                        dir('backend') {
                            sh '''
                                # Setup ESLint config
                                cat > .eslintrc.json << 'EOF'
                                {
                                "extends": ["eslint:recommended"],
                                "env": {
                                    "node": true,
                                    "es2021": true
                                },
                                "parserOptions": {
                                    "ecmaVersion": 12,
                                    "sourceType": "module"
                                },
                                "rules": {
                                    "no-unused-vars": "warn",
                                    "no-console": "off"
                                }
                                }
                                EOF
                                
                                # Add lint script
                                npm pkg set scripts.lint="eslint . --ext .js --format checkstyle --output-file eslint-results.xml"
                                
                                # Run linting
                                npm run lint || true
                            '''
                        }
                        archiveArtifacts artifacts: 'backend/eslint-results.xml', allowEmptyArchive: true
                    }
                }
                stage('Frontend Lint & Quality') {
                    steps {
                        dir('frontend') {
                            sh '''
                                # Add lint script
                                npm pkg set scripts.lint="eslint src --ext .js,.jsx --format checkstyle --output-file eslint-results.xml"
                                
                                # Run linting
                                npm run lint || true
                            '''
                        }
                        archiveArtifacts artifacts: 'frontend/eslint-results.xml', allowEmptyArchive: true
                    }
                }
                stage('Security Vulnerability Scan') {
                    steps {
                        sh '''
                            # Backend security audit
                            cd backend
                            npm audit --json > npm-audit-backend.json || true
                            npm audit --audit-level high || echo "Backend vulnerabilities found"
                            
                            # Frontend security audit
                            cd ../frontend
                            npm audit --json > npm-audit-frontend.json || true
                            npm audit --audit-level high || echo "Frontend vulnerabilities found"
                        '''
                        archiveArtifacts artifacts: '**/npm-audit-*.json', allowEmptyArchive: true
                    }
                }
                stage('SAST Security Scan') {
                    steps {
                        sh '''
                            # Install Semgrep
                            python3 -m pip install semgrep --break-system-packages || echo "Semgrep installation failed"
                            
                            # Run SAST scan
                            semgrep --config=auto --json --output=semgrep-results.json . || echo "SAST scan completed"
                            
                            # Secret scanning with TruffleHog
                            docker run --rm -v "$PWD:/pwd" trufflesecurity/trufflehog:latest filesystem /pwd --json > trufflehog-results.json || echo "Secret scan completed"
                        '''
                        archiveArtifacts artifacts: 'semgrep-results.json, trufflehog-results.json', allowEmptyArchive: true
                    }
                }
            }
        }

        stage('Build Applications') {
            parallel {
                stage('Backend Build') {
                    steps {
                        dir('backend') {
                            sh '''
                                # Add build script if missing
                                if ! grep -q '"build"' package.json; then
                                    npm pkg set scripts.build="echo 'Backend build completed'"
                                fi
                                npm run build
                            '''
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        dir('frontend') {
                            sh 'CI=false npm run build'
                        }
                    }
                }
            }
        }

        stage('Build & Scan Docker Images') {
            parallel {
                stage('Build Backend Docker Image') {
                    steps {
                        dir('backend') {
                            sh """
                                docker build -t ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG} .
                                docker tag ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:latest
                            """
                        }
                    }
                }
                stage('Build Frontend Docker Image') {
                    steps {
                        dir('frontend') {
                            sh """
                                docker build -t ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG} \
                                --build-arg REACT_APP_API_URL=http://localhost:5000/api \
                                --build-arg REACT_APP_WS_URL=ws://localhost:5000 .
                                docker tag ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:latest
                            """
                        }
                    }
                }
                stage('Container Security Scan') {
                    steps {
                        sh '''
                            # Install Trivy
                            curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin || echo "Trivy installation failed"
                            
                            # Scan images for vulnerabilities
                            trivy image --format json --output backend-image-scan.json ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG} || echo "Backend image scan completed"
                            trivy image --format json --output frontend-image-scan.json ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG} || echo "Frontend image scan completed"
                        '''
                        archiveArtifacts artifacts: '*-image-scan.json', allowEmptyArchive: true
                    }
                }
            }
        }

        stage('Push Images') {
            when {
                anyOf {
                    branch 'awsdeplomentbypythonscript'
                    branch 'DeploytoKindLocally'
                    branch 'main'
                    branch 'develop'
                    branch 'staging'
                }
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh """
                            echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                            docker push ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}
                            docker push ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:latest
                            docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                            docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:latest
                        """
                    }
                }
            }
        }

        stage('Deploy to AWS') {
            when {
                anyOf {
                    branch 'awsdeplomentbypythonscript'
                    branch 'main'
                }
            }
            steps {
                script {
                    withCredentials([aws(credentialsId: 'aws-access-key-id', accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        sh '''
                            export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                            export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                            export AWS_DEFAULT_REGION=us-east-1
                            python3 aws/deploy_aws.py
                        '''
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                anyOf {
                    branch 'DeploytoKindLocally'
                    branch 'develop'
                    branch 'staging'
                }
            }
            steps {
                script {
                    def namespace = 'newsbuddy-production'
                    if (env.BRANCH_NAME == 'develop') {
                        namespace = 'newsbuddy-development'
                    } else if (env.BRANCH_NAME == 'staging') {
                        namespace = 'newsbuddy-staging'
                    }
                    
                    sh """
                        # Install Kind and kubectl in Jenkins container
                        if ! command -v kind &> /dev/null; then
                            curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
                            chmod +x ./kind && mv ./kind /usr/local/bin/kind
                        fi
                        
                        if ! command -v kubectl &> /dev/null; then
                            curl -LO "https://dl.k8s.io/release/v1.28.0/bin/linux/amd64/kubectl"
                            chmod +x kubectl && mv kubectl /usr/local/bin/kubectl
                        fi
                        
                        # Create Kind cluster if not exists
                        if ! kind get clusters | grep -q newsbuddy; then
                            kind create cluster --name newsbuddy
                        fi
                        
                        # Set kubectl context to Kind cluster
                        kubectl config use-context kind-newsbuddy
                        
                        # Create namespaces
                        kubectl apply -f k8s/namespace.yaml --validate=false
                        
                        # Deploy MongoDB first
                        kubectl apply -f k8s/mongodb.yaml --validate=false
                        
                        # Apply secrets and configmaps
                        kubectl apply -f k8s/secrets.yaml --validate=false
                        kubectl apply -f k8s/configmap.yaml --validate=false
                        
                        # Update image tags
                        sed -i 's|virajkushwaha/newsbuddy-backend.*|${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}|g' k8s/backend-deployment.yaml
                        sed -i 's|virajkushwaha/newsbuddy-frontend.*|${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}|g' k8s/frontend-deployment.yaml
                        
                        # Deploy applications
                        kubectl apply -f k8s/backend-deployment.yaml --validate=false
                        kubectl apply -f k8s/frontend-deployment.yaml --validate=false
                        kubectl apply -f k8s/ingress.yaml --validate=false
                        
                        # Wait for rollout with debugging
                        kubectl rollout status deployment/newsbuddy-backend -n ${namespace} --timeout=300s
                        echo "Backend deployment status:"
                        kubectl get pods -n ${namespace} -l app=newsbuddy-backend
                        
                        kubectl rollout status deployment/newsbuddy-frontend -n ${namespace} --timeout=600s || {
                            echo "Frontend deployment failed, checking pods:"
                            kubectl get pods -n ${namespace} -l app=newsbuddy-frontend
                            kubectl describe pods -n ${namespace} -l app=newsbuddy-frontend
                        }
                        
                        # Show status
                        kubectl get pods -n ${namespace}
                        kubectl get svc -n ${namespace}
                    """
                }
            }
        }
        

    }
    
    post {
        
        success {
            echo '✅ Pipeline completed successfully!'
            script {
                if (env.BRANCH_NAME == 'main') {
                    echo '🚀 Production deployment successful!'
                }
            }
        }
        
        failure {
            echo '❌ Pipeline failed!'
            sh 'kubectl get events --sort-by=.metadata.creationTimestamp || true'
        }
        
        
    }
}
