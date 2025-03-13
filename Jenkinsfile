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
        stage('Prepare and Execute All Stages 🚀') {
            steps {
                script {
                    sh """
                        echo "🟢 Menjalankan sebagai user:"

                        sudo -u kojidev -i zsh << 'EOF'
                        echo "User saat ini: \$(whoami)"
                        
                        # Load environment
                        source ~/.zshrc

                        echo "📁 Berpindah ke direktori: ${SERVER_PATH}"
                        cd '${SERVER_PATH}' || exit 1
                        pwd

                        BRANCH_NAME=\$(echo '${GIT_BRANCH}' | sed "s|.*/||")
                        echo "🔀 Branch name: \$BRANCH_NAME"

                        echo "🔄 Fetching origin"
                        git fetch --all
                        git checkout "\$BRANCH_NAME"
                        git pull origin "\$BRANCH_NAME"

                        echo "🛠️ Node: \$(which node)"
                        echo "🛠️ npm: \$(which npm)"
                        echo "🛠️ npx: \$(which npx)"
                        echo "🛠️ pm2: \$(which pm2)"

                        echo "📦 Menyalin environment"
                        cp .env.production .env

                        echo "📦 Menginstall dependency"
                        npm install

                        echo "📊 Menjalankan migrasi Prisma"
                        npx prisma db push

                        echo "🛠️ Membuat build aplikasi"
                        npm run build --update-env

                        echo "🚀 Restarting PM2"
                        pm2 restart '${APP_INDEX}'
                        pm2 save

                        echo "✅ Deployment Complete 🚀"
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
            echo 'Pipeline selesai.'
        }
    }
}
