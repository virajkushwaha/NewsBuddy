pipeline{
	agent any

	stages{
		stage('checkout'){
			steps{
				checkout scm
				}
		}
		stage('Check Node Environment') {
    			steps {
        			sh 'node -v'
        			sh 'npm -v'
    			}
		}
		
		stage('Installing Dependencies'){
			steps{
				sh 'npm install'
			}
		}

		stage('Build'){
			steps{
				sh 'npm run build'
			}
		}
		stage('Test'){
			steps{
				sh 'npm test || true'
			}
		}
	}
	post {
		success{
			echo 'Pipeline finished successfully!'
		}
		failure{
			echo 'Pipeline failed.'
		}
	}
}
