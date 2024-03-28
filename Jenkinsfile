def COLOR_MAP = [
    'SUCCESS' : 'good',
    'FAILURE' : 'danger',
]

pipeline{

    agent {label 'BACK'}

    tools {
        nodejs 'NODE18'
    }


    stages{


        // Stage to create .env once (If It Doesn't Exist)
        stage('Create .env file') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'ENV', variable: 'SECRET_FILE')]) {
                    if (!fileExists('.env')) {
                            sh 'cp $SECRET_FILE .env'
                        }
                    } else {
                        def envContent = readFile('.env').trim()
                        if ('$SECRET_FILE' != envContent) {
                            writeFile file: '.env', text: secretContent, encoding: 'UTF-8'
                            echo '.env file updated'
                        } else {
                            echo '.env file is up to date'
                        }
                    }
                }
            }
        }


        // Installing Dependancies With NPM
        // stage('NPM Install'){
        //     steps {
        //             sh 'npm install'
                    
        //             // install pm2
        //     }
        // }

        // restrating pm2
        // stage('Restart') {
        //     steps {
        //         script {
        //         def pm2ListOutput = sh(script: 'pm2 list', returnStdout: true).trim()
        //         if (pm2ListOutput.contains('your-app-name')) {
        //             sh 'pm2 restart your-app-name'
        //         } else {
        //             echo 'Application is not running, starting it...'
        //             sh 'pm2 start ecosystem.config.js'
        //         }
        //         }
        //     }
        // }

        
    }

    post {
        success {
            echo 'Slack Notifications .'
            slackSend channel: 'internhub-backend',
                color: COLOR_MAP[currentBuild.currentResult],
                message: "*${currentBuild.currentResult}:* Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}"
            script {
                currentBuild.rawBuild.delete() // Delete build history when successful
            } 
        }

        failure {
            echo 'Slack Notifications .'
            slackSend channel: 'internhub-backend',
                color: COLOR_MAP[currentBuild.currentResult],
                message: "*${currentBuild.currentResult}:* Job ${env.JOB_NAME} build ${env.BUILD_NUMBER} \n More info at: ${env.BUILD_URL}"
        }

        aborted {
            echo 'Slack Notifications .'
            slackSend channel: 'internhub-backend',
                color: COLOR_MAP[currentBuild.currentResult],
                message: "*${currentBuild.currentResult}:* Job ${env.JOB_NAME} build ${env.BUILD_NUMBER} \n More info at: ${env.BUILD_URL}"
        }
    }
}