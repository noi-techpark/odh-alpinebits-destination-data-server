pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "app"
        DOCKER_TAG = "latest"
    }

    stages {
        stage('Configure') {
            steps {
                sh "cp .env.example .env"
                sh "echo 'DOCKER_IMAGE=${DOCKER_IMAGE}' >> .env"
                sh "echo 'DOCKER_TAG=${DOCKER_TAG}' >> .env"
            }
        }
        stage('Test & Build') {
            steps {
                sh "docker-compose -f infrastructure/docker-compose.build.yml build"
            }
        }
    }
    post { 
        always { 
            sh 'docker-compose -f infrastructure/docker-compose.build.yml down || true'
        }
    }
}
