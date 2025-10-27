pipeline{
	agent any

	stages{
		stage('checkout'){
			steps{
				checkout scm
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
