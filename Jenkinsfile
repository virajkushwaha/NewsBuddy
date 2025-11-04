pipeline {
    agent any

    environment {
        CI = 'false' // Prevents create-react-app from treating builds as CI
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
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Installing Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Building Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
                stage('Building Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                                sh 'npm test'
                            }
                        }
                    }
                }
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                                sh 'npm test'
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline finished successfully!'
        }
        failure {
            echo '❌ Pipeline failed.'
        }
        unstable {
            echo '⚠️ Pipeline completed with test failures.'
        }
    }
}
