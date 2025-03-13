pipeline {
    agent { label 'built-in-node' }

    environment {
        SSH_HOST = "${env.SSH_HOST_KOJIDEV}"
        SSH_USER = "${env.SSH_USER_KOJIDEV}"
        SSH_PORT = "${env.SSH_PORT_KOJIDEV}"
        SSH_CREDENTIALS = "${env.SSH_CREDENTIALS}"
        SERVER_PATH = "${env.SERVER_PATH_PORTFOLIO_KOJIDEV}"
        APP_INDEX = "${env.APP_INDEX_PORTFOLIO_KOJIDEV}"
    }

    stages {
        stage('Check Environment & User') {
            steps {
                script {
                    sh """
                        sudo -u kojidev -i zsh << 'EOF'
                        echo "🟢 Menjalankan sebagai user: \$(whoami)"
                    """
                }
            }
        }

        stage('Prepare Repository') {
            steps {
                script {
                    sh """
                        sudo -u kojidev -i zsh << 'EOF'
                        sudo chown -R kojidev:kojidev '${SERVER_PATH}/.git'

                        cd '${SERVER_PATH}' || exit 1
                        pwd

                        BRANCH_NAME=\$(echo '${GIT_BRANCH}' | sed "s|.*/||")
                        echo "🔀 Branch: \$BRANCH_NAME"

                        # Bersihkan cache dan kunci Git
                        git gc --prune=now
                        rm -f .git/index.lock

                        echo "🔄 Fetching origin"
                        git fetch --all
                        git checkout "\$BRANCH_NAME"
                        git pull origin "\$BRANCH_NAME"
                    """
                }
            }
        }

        stage('Check Node & Package Manager') {
            steps {
                script {
                    sh """
                        sudo -u kojidev -i zsh << 'EOF'
                        source ~/.zshrc
                        echo "🛠️ Node: \$(which node)"
                        echo "🛠️ npm: \$(which npm)"
                        echo "🛠️ npx: \$(which npx)"
                        echo "🛠️ pm2: \$(which pm2)"
                    """
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh """
                        sudo -u kojidev -i zsh << 'EOF'
                        source ~/.zshrc
                        cd '${SERVER_PATH}' || exit 1
                        echo "📦 Menyalin environment"
                        cp .env.production .env

                        echo "📦 Menginstall dependency"
                        npm install
                    """
                }
            }
        }

        stage('Run Prisma Migration') {
            steps {
                script {
                    sh """
                        sudo -u kojidev -i zsh << 'EOF'
                        source ~/.zshrc
                        cd '${SERVER_PATH}' || exit 1
                        echo "📊 Menjalankan migrasi Prisma"
                        npx prisma db push
                    """
                }
            }
        }

        stage('Build Application') {
            steps {
                script {
                    sh """
                        sudo -u kojidev -i zsh << 'EOF'
                        source ~/.zshrc
                        cd '${SERVER_PATH}' || exit 1
                        echo "🛠️ Membuat build aplikasi"
                        npm run build --update-env
                    """
                }
            }
        }

        stage('Restart PM2') {
            steps {
                script {
                    sh """
                        sudo -u kojidev -i zsh << 'EOF'
                        source ~/.zshrc
                        cd '${SERVER_PATH}' || exit 1
                        echo "🚀 Restarting PM2"
                        pm2 restart '${APP_INDEX}'
                        pm2 save
                    """
                }
            }
        }
    }

    post {
        success {
            echo '🎉 Deployment Berhasil!'
        }
        failure {
            echo '❌ Deployment Gagal!'
        }
        always {
            echo '✅ Pipeline selesai.'
        }
    }
}
