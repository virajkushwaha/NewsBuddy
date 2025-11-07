pipeline {
    agent any

    environment {
        CI = false
        IMAGE_TAG = "${env.BUILD_NUMBER}"
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
                            def backendImage = "newsbuddy-backend-image"
                            dir('backend') {
                                docker.build(backendImage)
                            }
                        }
                    }
                }
                stage('Build Frontend Docker Image') {
                    steps {
                        script {
                            def frontendImage = "newsbuddy-frontend-image"
                            dir('frontend') {
                                docker.build(frontendImage)
                            }
                        }
                    }
                }
            }
        }

        stage('Push Images') {
            parallel {
                stage('Push Backend Image') {
                    steps {
                        script {
                            def imageName = "newsbuddy-backend-image"
                            def dockerHubRepo = "virajkushwaha/${imageName}"

                            withCredentials([usernamePassword(credentialsId: 'docker-hub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                                sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                                sh "docker tag ${imageName}:latest ${dockerHubRepo}:${env.IMAGE_TAG}"
                                sh "docker push ${dockerHubRepo}:${env.IMAGE_TAG}"
                            }
                        }
                    }
                }

                stage('Push Frontend Image') {
                    steps {
                        script {
                            def imageName = "newsbuddy-frontend-image"
                            def dockerHubRepo = "virajkushwaha/${imageName}"

                            withCredentials([usernamePassword(credentialsId: 'docker-hub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                                sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                                sh "docker tag ${imageName}:latest ${dockerHubRepo}:${env.IMAGE_TAG}"
                                sh "docker push ${dockerHubRepo}:${env.IMAGE_TAG}"
                            }
                        }
                    }
                }
            }
        }
        stage('Deploy to Kind') {
            steps {
                script {
                    sh "kind load docker-image newsbuddy-backend-image:${env.IMAGE_TAG}"
                    sh "kind load docker-image newsbuddy-frontend-image:${env.IMAGE_TAG}"
                    sh "kubectl apply -f k8s/"
                }
            }
        }
    }
}
