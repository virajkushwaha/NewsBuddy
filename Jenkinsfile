pipeline {
    agent any
    
    environment {
        CI=false
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                
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
       
       stage('Build') {
		parallel {
			stage('Backend Build') {
				steps {
					dir('backend') {
						sh 'npm build'
					}
					
				}
				steps {
					dir('frontend') {
						sh 'npm build'
					}
				}
			}

		}
       }

    }
    

}
