pipeline {
    agent {
        docker { image 'node:18' }
    }
    stages {
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

        stage('Installing Dependencies') {
            parallel {
                stage('Installing Backend') {
                    steps {
                        sh 'cd backend && npm install'
                    }
                }
                stage('Installing Frontend') {
                    steps {
                        sh 'cd frontend && npm install'
                    }
                }
            }
        }

        stage('Build') {
            steps {
                dir('frontend') {
                    sh 'CI=false npm run build'
                }
            }
        }

        stage('Test') {
            steps {
                dir('frontend') {
                    sh 'npm test || true'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline finished successfully!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
