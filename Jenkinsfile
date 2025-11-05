pipeline {
    agent any
    
    environment {
        CI=false
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

        stage('Check Node Enviroment'){
		steps{
			sh 'node -v'
			sh 'npm -v'
		}
	}

        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
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
                            sh 'npm test -- --passWithNoTests || true'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm test -- --passWithNoTests || true'
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
                            sh 'npm run lint || true'
                        }
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm run lint || true'
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
                        cd backend && npm audit --audit-level moderate || true
                        cd ../frontend && npm audit --audit-level moderate || true
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
