pipeline {
    agent any
    environment {
        SSH_HOST = "${env.SSH_HOST_KOJIDEV}"
        SSH_USER = "${env.SSH_USER_KOJIDEV}"
        SSH_PORT = "${env.SSH_PORT_KOJIDEV}"
        SSH_CREDENTIALS = "${env.SSH_CREDENTIALS}"
        SERVER_PATH = '/var/www/api-portfolio'
        APP_NAME = 'Kojidev Backend Portfolio'
    }
    stages {
        stage('Prepare Branch Name 🌿') {
            when {
                expression { env.GIT_BRANCH == 'origin/main' }
            }
            steps {
                script {
                    def branchName = "${GIT_BRANCH.replaceFirst(/^.*\//, '')}"
                    echo "Branch name: ${branchName}"

                    env.BRANCH_NAME = branchName
                }
            }
        }

        stage('Fetch & Pull⚙️') {
            when {
                expression { env.GIT_BRANCH == 'origin/main' }
            }
            steps {
                script {
                    sshagent(credentials: [SSH_CREDENTIALS]) {
                        sh """
                            ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} "
                                cd ${SERVER_PATH}
                                git fetch --all
                                git checkout ${env.BRANCH_NAME}
                                git pull origin ${env.BRANCH_NAME}
                            "
                        """
                    }
                }
            }
        }

        stage('Copy environment file production 📝') {
            when {
                expression { env.GIT_BRANCH == 'origin/main' }
            }
            steps {
                script {
                    sshagent(credentials: [SSH_CREDENTIALS]) {
                        sh """
                            ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} "
                                cd ${SERVER_PATH}
                                cp .env.production .env
                            "
                        """
                    }
                }
            }
        }

        stage('Install Dependencies 📦') {
            when {
                expression { env.GIT_BRANCH == 'origin/main' }
            }
            steps {
                script {
                    sh """
                    export NVM_DIR=/home/kojidev/.nvm
                    [ -s \$NVM_DIR/nvm.sh ] && \\. \$NVM_DIR/nvm.sh
                    cd /var/www/api-portfolio
                    npm install
                    """
                }
            }
        }

        stage('Handle PM2 🚀') {
            when {
                expression { env.GIT_BRANCH == 'origin/main' }
            }
            steps {
                script {
                    sh """
                        export PM2_PATH=/home/kojidev/.nvm/versions/node/v20.18.1/bin/pm2
                        cd ${SERVER_PATH}
                        \$PM2_PATH restart ${APP_NAME} || \$PM2_PATH start npm --name ${APP_NAME} -- run start

                        \$PM2_PATH save
                    """
                }
            }
        }

        stage('Deployment Complete 🚀') {
            when {
                expression { env.GIT_BRANCH == 'origin/main' }
            }
            steps {
                script {
                    sh """
                        cd ${SERVER_PATH}
                        echo "Deployed to VPS!"
                    """
                }
            }
        }
    }
    post {
        always {
            echo 'Pipeline selesai.'
        }
    }
}
