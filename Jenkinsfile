pipeline {
    agent any

    environment {
        CI = false
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

        stage('Check Node Environment') {
            steps {
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
                    sh '''
                        cd backend && npm audit --audit-level moderate || true
                        cd ../frontend && npm audit --audit-level moderate || true
                    '''
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Backend Build') {
                    steps {
                        dir('backend') {
                            sh 'npm run build'
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
	stage('Build Docker Images') {
        parallel {
            stage('Build Backend Docker Image') {
                steps {
                    script {
                        def backendImage = 'newsbuddy-backend-image:${env.BUILD_TAG}'
                        dir('backend') {
                            docker.build(backendImage, '.')
                        }
                    }
                    
                }
            }
            stage('Build Frontend Docker Image') {
                steps {
                    script{
                        def frontendImage = "newsbuddy-frontend-image:${env.BUILD_TAG}"
                        dir('frontend') {
                            docker.build(frontendImage, '.')
                        }
                    }
                }
            }
        }
	
	}
    }
}
