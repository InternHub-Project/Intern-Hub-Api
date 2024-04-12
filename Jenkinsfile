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
                    def containerIds = sh(script: 'docker ps -a -q', returnStdout: true).trim().split('\n')
                    if (containerIds.size() == 1 && (containerIds[0] == '' || containerIds[0] == '\n')) {
                        echo 'No Docker containers to stop or remove'
                    } else {
                        containerIds.each { containerId ->
                            sh "docker stop ${containerId}"
                            sh "docker rm ${containerId}"
                        }
                    }


                    def imageIds = sh(script: 'docker images -q', returnStdout: true).trim().split('\n')
                    if (imageIds.size() == 1 && (imageIds[0] == '' || imageIds[0] == '\n')) {
                        echo 'No Docker images to remove'
                    } else {
                        imageIds.each { imageId ->
                            sh "docker rmi ${imageId}"
                        }
                    }
                }
            }
        }

        stage('Creating Docker Image') {
            steps{

                sh 'docker build -t backend .'
            }
        }


        stage('Creating Docker Container') {
            steps{
                sh 'docker run -d --name InternHub backend'
            }
        }

        stage('Running Ansible Playbook'){
            steps{
                sh 'ansible-playbook Backend-CICD_newUpdate/ansible/playbooks/nginx-book.yml'
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