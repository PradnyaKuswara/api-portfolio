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
                    sshagent(credentials: [SSH_CREDENTIALS]) {
                        sh """
                            ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} "
                                cd ${SERVER_PATH}
                                npm install
                            "
                        """
                    }
                }
            }
        }
        
        stage('Handle PM2 🚀') {
            when {
                expression { env.GIT_BRANCH == 'origin/main' }
            }
            steps {
                script {
                    sshagent(credentials: [SSH_CREDENTIALS]) {
                        sh """
                            ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} "
                                cd ${SERVER_PATH}
                                # Restart the application with PM2 (or start if not running)
                                pm2 restart ${APP_NAME} || pm2 start npm --name ${APP_NAME} -- run start

                                # Save the PM2 process list to ensure the app restarts after reboot
                                pm2 save
                            "
                        """
                    }
                }
            }
        }
        
        stage('Deployment Complete 🚀') {
            when {
                expression { env.GIT_BRANCH == 'origin/main' }
            }
            steps {
                script {
                    sshagent(credentials: [SSH_CREDENTIALS]) {
                        sh """
                            ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} 'echo "Deployed to VPS!"'
                        """
                    }
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
