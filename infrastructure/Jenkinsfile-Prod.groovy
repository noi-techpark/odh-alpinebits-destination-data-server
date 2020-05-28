pipeline {
    agent any

    environment {
        DOCKER_PROJECT_NAME = "alpinebits-destination-data-server"
        DOCKER_IMAGE = "755952719952.dkr.ecr.eu-west-1.amazonaws.com/alpinebits-destination-data-server"
        DOCKER_TAG = "prod-$BUILD_NUMBER"
        
        SERVER_PORT = "1003"
        
        REF_SERVER_CORS_ORIGIN = "*"
        REF_SERVER_URL = "https://destinationdata.alpinebits.opendatahub.bz.it"
        ODH_BASE_URL = "https://tourism.opendatahub.bz.it/api/"
        ODH_TIMEOUT = "60000"
    }

    stages {
        stage('Configure') {
            steps {
                sh """
                    rm -f .env
                    cp .env.example .env
                    echo 'COMPOSE_PROJECT_NAME=${DOCKER_PROJECT_NAME}' >> .env
                    echo 'DOCKER_IMAGE=${DOCKER_IMAGE}' >> .env
                    echo 'DOCKER_TAG=${DOCKER_TAG}' >> .env

                    echo 'SERVER_PORT=${SERVER_PORT}' >> .env

                    echo 'REF_SERVER_CORS_ORIGIN=${REF_SERVER_CORS_ORIGIN}' >> .env
                    echo 'REF_SERVER_URL=${REF_SERVER_URL}' >> .env
                    echo 'ODH_BASE_URL=${ODH_BASE_URL}' >> .env
                    echo 'ODH_TIMEOUT=${ODH_TIMEOUT}' >> .env
                """
            }
        }
        stage('Build') {
            steps {
                sh '''
                    aws ecr get-login --region eu-west-1 --no-include-email | bash
                    docker-compose --no-ansi -f infrastructure/docker-compose.build.yml build --pull
                    docker-compose --no-ansi -f infrastructure/docker-compose.build.yml push
                '''
            }
        }
        stage('Deploy') {
            steps {
               sshagent(['jenkins-ssh-key']) {
                    sh """
                        (cd infrastructure/ansible && ansible-galaxy install -f -r requirements.yml)
                        (cd infrastructure/ansible && ansible-playbook --limit=prod deploy.yml --extra-vars "release_name=${BUILD_NUMBER}")
                    """
                }
            }
        }
    }
}
