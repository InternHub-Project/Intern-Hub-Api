def COLOR_MAP = [
    'SUCCESS' : 'good',
    'FAILURE' : 'danger',
]

pipeline{

    agent {label 'BACK'}

     environment {
        PATH = "/root/.nvm/versions/node/v21.7.1/bin/npm:${env.PATH}"
    }

    tools {
        nodejs 'NODE21'
    }

    stages{

        // Create Or Update ENV File
        //stage('Create Or Update .env File') {
            // steps {
            //     script {
            //         if (!fileExists('.env')) {
            //             withCredentials([file(credentialsId: 'ENV', variable: 'SECRET_FILE')]) {
            //                 sh 'cp $SECRET_FILE .env'
            //             }
            //         } else {
            //             withCredentials([file(credentialsId: 'ENV', variable: 'NEW_FILE')]) {
            //                 def secretContent = readFile(env.NEW_FILE).trim()
            //                 def envContent = readFile('.env').trim()
            //                 if (secretContent != envContent) {
            //                     writeFile file: '.env', text: secretContent, encoding: 'UTF-8'
            //                     echo '.env file updated'
            //                 } else {
            //                     echo '.env file is up to date'
            //                 }
            //             }
            //         }
            //     }
            // }
        //}

        // stage('Set up environment') {
        //     steps {
        //         script {
        //             sh 'export NVM_DIR=/home/ubuntu/.nvm'
        //         }
        //     }
        // }

        // Installing Dependancies And PM2 With NPM
        stage('Installing Dependencies') {
            steps {
                    sh 'npm install'

                    
            }
        }
        

        // Restrating The Server When An Update Happens 
        stage('PM2') {
            steps {

                sh 'pm2 start npm -- start'
                //script {

                    // def pm2ListOutput = sh(script: 'pm2 list', returnStdout: true).trim()
                    // if (pm2ListOutput.contains('npm')) {
                    //     sh 'pm2 restart 0'
                    // } else {
                    //     echo 'Application is not running, starting it...'
                    //     sh 'pm2 start npm -- start'
                    // }
                //}
            }
        }
        
    }

    post {
        success {
            echo 'Slack Notifications .'
            slackSend channel: 'internhub-backend',
                color: COLOR_MAP[currentBuild.currentResult],
                message: "*${currentBuild.currentResult}:* Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}"
            // script {
            //     currentBuild.rawBuild.delete() // Delete build history when successful
            // } 
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