// def COLOR_MAP = [
//     'SUCCESS' : 'good',
//     'FAILURE' : 'danger',
// ]

pipeline{

    agent {label 'BACK'}



   stages{

    // Testing Ansible 
    // stage ('Ansible'){
    //     steps{

    //         sh 'ansible --version'
    //     }
    // }

//         // Create Or Update ENV File
//         //stage('Create Or Update .env File') {
//             // steps {
//             //     script {
//             //         if (!fileExists('.env')) {
//             //             withCredentials([file(credentialsId: 'ENV', variable: 'SECRET_FILE')]) {
//             //                 sh 'cp $SECRET_FILE .env'
//             //             }
//             //         } else {
//             //             withCredentials([file(credentialsId: 'ENV', variable: 'NEW_FILE')]) {
//             //                 def secretContent = readFile(env.NEW_FILE).trim()
//             //                 def envContent = readFile('.env').trim()
//             //                 if (secretContent != envContent) {
//             //                     writeFile file: '.env', text: secretContent, encoding: 'UTF-8'
//             //                     echo '.env file updated'
//             //                 } else {
//             //                     echo '.env file is up to date'
//             //                 }
//             //             }
//             //         }
//             //     }
//             // }
//         //}

        stage('Check Docker Resources') {
            steps {
                script {
                    def containerExists = sh(script: 'docker ps -a', returnStatus: true) == 0
                    def imageExists = sh(script: 'docker images', returnStatus: true) == 0

                    if (containerExists) {
                        sh 'docker stop $(docker ps-a -q)'
                        sh 'docker rm $(docker ps-a -q)'
                    } else {
                        echo 'Docker container does not exist'
                    }

                    if (imageExists) {
                        sh 'docker rmi $(docker iamges -q)'
                    } else {
                        echo 'Docker image does not exist'
                    }
                }
            }
        }

//     post {
//         success {
//             echo 'Slack Notifications .'
//             slackSend channel: 'internhub-backend',
//                 color: COLOR_MAP[currentBuild.currentResult],
//                 message: "*${currentBuild.currentResult}:* Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}"
//             // script {
//             //     currentBuild.rawBuild.delete() // Delete build history when successful
//             // } 
//         }

//         failure {
//             echo 'Slack Notifications .'
//             slackSend channel: 'internhub-backend',
//                 color: COLOR_MAP[currentBuild.currentResult],
//                 message: "*${currentBuild.currentResult}:* Job ${env.JOB_NAME} build ${env.BUILD_NUMBER} \n More info at: ${env.BUILD_URL}"
//         }

//         aborted {
//             echo 'Slack Notifications .'
//             slackSend channel: 'internhub-backend',
//                 color: COLOR_MAP[currentBuild.currentResult],
//                 message: "*${currentBuild.currentResult}:* Job ${env.JOB_NAME} build ${env.BUILD_NUMBER} \n More info at: ${env.BUILD_URL}"
//         }
    }
}