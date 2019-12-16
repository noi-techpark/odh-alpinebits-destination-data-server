pipeline {
    agent any

    environment {
        AWS_ACCESS_KEY_ID = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
        DOCKER_IMAGE_APP = "755952719952.dkr.ecr.eu-west-1.amazonaws.com/alpinebits-destination-data-server"
        DOCKER_TAG_APP = "test-$BUILD_NUMBER"
        DOCKER_SERVICES = "app"
        DOCKER_SERVER_IP = "63.33.73.203"
        DOCKER_SERVER_DIRECTORY = "/var/docker/alpinebits-destination-data-server"
        DOCKER_SERVER_PORT = "1007"
        DOCKER_SERVER_PROJECT = "alpinebits-destination-data-server"
        REF_SERVER_CORS_ORIGIN = "*"
        REF_SERVER_URL = "https://destinationdata.alpinebits.opendatahub.testingmachine.eu"
        ODH_BASE_URL = "https://tourism.opendatahub.bz.it/api/"
        ODH_TIMEOUT = "60000"
    }

    stages {
        stage('Configure') {
            steps {
                sh "cp .env.example .env"
                sh "echo 'DOCKER_IMAGE_APP=${DOCKER_IMAGE_APP}' >> .env"
                sh "echo 'DOCKER_TAG_APP=${DOCKER_TAG_APP}' >> .env"

                sh 'sed -i -e "s%\\(DOCKER_SERVER_PORT\\s*=\\).*\\$%\\1${DOCKER_SERVER_PORT}%" .env'
                sh 'sed -i -e "s%\\(REF_SERVER_CORS_ORIGIN\\s*=\\).*\\$%\\1${REF_SERVER_CORS_ORIGIN}%" .env'
                sh 'sed -i -e "s%\\(REF_SERVER_URL\\s*=\\).*\\$%\\1${REF_SERVER_URL}%" .env'
                sh 'sed -i -e "s%\\(ODH_BASE_URL\\s*=\\).*\\$%\\1${ODH_BASE_URL}%" .env'
                sh 'sed -i -e "s%\\(ODH_TIMEOUT\\s*=\\).*\\$%\\1${ODH_TIMEOUT}%" .env'
            }
        }
        stage('Build & Push') {
            steps {
                sh "aws ecr get-login --region eu-west-1 --no-include-email | bash"
                sh "docker-compose -f docker-compose.build.yml build ${DOCKER_SERVICES}"
                sh "docker-compose -f docker-compose.build.yml push ${DOCKER_SERVICES}"
            }
        }
        stage('Deploy') {
            steps {
                sshagent(['jenkins-ssh-key']) {
                    sh """ssh -o StrictHostKeyChecking=no ${DOCKER_SERVER_IP} 'AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}" AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}" bash -c "aws ecr get-login --region eu-west-1 --no-include-email | bash"'"""

                    sh "ssh -o StrictHostKeyChecking=no ${DOCKER_SERVER_IP} 'ls -1t ${DOCKER_SERVER_DIRECTORY}/releases/ | tail -n +10 | grep -v `readlink -f ${DOCKER_SERVER_DIRECTORY}/current | xargs basename --` -- | xargs -r printf \"${DOCKER_SERVER_DIRECTORY}/releases/%s\\n\" | xargs -r rm -rf --'"
                
                    sh "ssh -o StrictHostKeyChecking=no ${DOCKER_SERVER_IP} 'mkdir -p ${DOCKER_SERVER_DIRECTORY}/releases/${BUILD_NUMBER}'"
                    sh "pv docker-compose.run.yml | ssh -o StrictHostKeyChecking=no ${DOCKER_SERVER_IP} 'tee ${DOCKER_SERVER_DIRECTORY}/releases/${BUILD_NUMBER}/docker-compose.yml'"
                    sh "pv .env | ssh -o StrictHostKeyChecking=no ${DOCKER_SERVER_IP} 'tee ${DOCKER_SERVER_DIRECTORY}/releases/${BUILD_NUMBER}/.env'"
                    sh "ssh -o StrictHostKeyChecking=no ${DOCKER_SERVER_IP} 'cd ${DOCKER_SERVER_DIRECTORY}/releases/${BUILD_NUMBER} && docker-compose --project-name=${DOCKER_SERVER_PROJECT} pull'"

                    sh "ssh -o StrictHostKeyChecking=no ${DOCKER_SERVER_IP} '[ -d \"${DOCKER_SERVER_DIRECTORY}/current\" ] && (cd ${DOCKER_SERVER_DIRECTORY}/current && docker-compose --project-name=${DOCKER_SERVER_PROJECT} down) || true'"
                    sh "ssh -o StrictHostKeyChecking=no ${DOCKER_SERVER_IP} 'ln -sfn ${DOCKER_SERVER_DIRECTORY}/releases/${BUILD_NUMBER} ${DOCKER_SERVER_DIRECTORY}/current'"
                    sh "ssh -o StrictHostKeyChecking=no ${DOCKER_SERVER_IP} 'cd ${DOCKER_SERVER_DIRECTORY}/current && docker-compose --project-name=${DOCKER_SERVER_PROJECT} up --detach'"
                }
            }
	    }
    }
}
