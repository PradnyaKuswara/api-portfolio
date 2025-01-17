pipeline {
    agent any
    environment {
        SSH_HOST = "${env.SSH_HOST_KOJIDEV}"
        SSH_USER = "${env.SSH_USER_KOJIDEV}"
        SSH_PORT = "${env.SSH_PORT_KOJIDEV}"
        SSH_CREDENTIALS = "${env.SSH_CREDENTIALS}"
        SERVER_PATH = "${env.SERVER_PATH_PORTFOLIO_KOJIDEV}"
        APP_INDEX = "${env.APP_INDEX_PORTFOLIO_KOJIDEV}"
    }
    stages {
        stage('Prepare and Execute All Stages 🚀') {
            steps {
                script {
                    sshagent(credentials: [SSH_CREDENTIALS]) {
                        sh """
                            ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} "
                                cd ${SERVER_PATH}

                                # Stage: Prepare Branch Name 🌿
                                BRANCH_NAME=\$(echo ${GIT_BRANCH} | sed 's|.*/||')
                                echo 'Branch name: \$BRANCH_NAME'
                                git fetch --all
                                git checkout \$BRANCH_NAME
                                git pull origin \$BRANCH_NAME

                                # Stage: Copy environment file production 📝
                                cp .env.production .env

                                # Stage: Install Dependencies & Migrate 📦
                                source ~/.zshrc
                                npm install
                                npx prisma db push
                                npm run build --update-env  

                                # Stage: Handle PM2 🚀
                                pm2 restart ${APP_INDEX}
                                pm2 save

                                echo 'Deployment Complete 🚀'
                            "
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
