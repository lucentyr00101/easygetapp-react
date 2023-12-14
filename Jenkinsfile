def ERROR_MESSAGE
boolean PIPELINE_SUCCESS = true

pipeline {
    agent 
    {
        node 
        {
            label 'maven && devops'
        }
    }
  
    environment 
    {
        ENVIRONMENT = 'staging'

        // Harbor env
        REGISTRY = 'harbor-ali.mir708090.com'
        DOCKER_REPOSITORY_SERVER = "https://${REGISTRY}"
        HARBOR_ID = 'harbor-ali'
        DOCKERHUB_NAMESPACE = "easygetapp/${ENVIRONMENT}"
        IMAGE_REPOSITORY = "easygetapp-fe-react"
        GITLAB_CREDENTIALS = 'gitlab'
        GITLAB_REPOSITORY_URL = 'https://gitlab.go019.com/easygetapp/easygetapp-fe-react.git'
        SCAPED_BRANCH_NAME = BRANCH.replaceAll('/','-')
        BRANCH = "release/1.0.0"
        GITLAB_CREDENTIALS_DEPLOY = 'gitlab'
        GITLAB_REPOSITORY_URL_DEPLOY = 'https://gitlab.go019.com/devops1/devops.git'
        BRANCH_DEPLOY = 'master'

        // Telegram env
        BOT_TOKEN = 'bot5405564816%3AAAGha_5I23kbupAfqy8aK4pXUz7hXU7CBPM' //DevOps Bot
        CHAT_ID = '-871330041' //Personal Page
        //CHAT_ID = '-1733433470'
        DISABLE_NOTIFICATION = 'false'

        // Project env
        APPLICATION_NAME = 'EasyGetApp-FE-React'
        PROJECT_NAME = 'easygetapp'
        ARTIFACT_PATH = "${ENVIRONMENT}%252Feasygetapp-fe-react" // For / replace with %252F

        // Kubernetes env
        NAMESPACE = 'easygetapp'
        DEPLOYMENT_NAME = 'easygetapp-fe-react'
        HELM_PATH = 'helm-charts/EasyGetApp/easygetapp-fe-react'
        KUBECONFIG_CREDENTIAL_ID = 'kubeconfig-id'

        BUILD_TRIGGER_BY = "${currentBuild.getBuildCauses()[0].shortDescription} / ${currentBuild.getBuildCauses()[0].userId}"
        GIT_COMMIT_HASH = "Error"
        IMAGE_TAG = "image-tag"
    }

    stages 
    {

        stage ('Checkout GitSCM')
        {
            steps
            {
                container('maven') {
                    script
                    {
                        try 
                        {
                            BUILD_TRIGGER_BY = "${currentBuild.getBuildCauses()[0].shortDescription} / ${currentBuild.getBuildCauses()[0].userId}"
                            checkout([
                                $class: 'GitSCM', 
                                    branches: [[
                                    name: "*/${BRANCH}"
                                ]], 
                                doGenerateSubmoduleConfigurations: false, 
                                 extensions: [[
                                    $class: 'CloneOption', 
                                    timeout: 20, 
                                    noTags: false
                                ]], 
                                submoduleCfg: [], 
                                userRemoteConfigs: [[
                                    credentialsId: "${GITLAB_CREDENTIALS}", 
                                    url: "${GITLAB_REPOSITORY_URL}"]]
                                ])
                            sh "ls -lah ./ && git config --global --add safe.directory /home/jenkins/agent/workspace/asygetapp-fe-build_release_1.0.0"
                            GIT_COMMIT_HASH = sh (script: "git rev-parse --short HEAD", returnStdout: true).trim()
                        }
                        catch(e)
                        {
                            PIPELINE_SUCCESS = false
                            ERROR_MESSAGE = "${ERROR_MESSAGE} ${e} \n" 
                            print e
                            currentBuild.result = 'FAILURE'
                        }
                    }
                }
            }
        }

        stage ('Pre-Build Notification')
        {
            steps
            {
                container('maven') {
                    script
                    {
                        notification("🔧 We are building rockets!")
                        //echo "done"
                    }
                }
            }

        }

        stage("Build image") 
        {
            steps 
            {
                container('maven') {
                    script 
                    {
                        try {
                            docker.build("${REGISTRY}/${DOCKERHUB_NAMESPACE}/${IMAGE_REPOSITORY}:${SCAPED_BRANCH_NAME}-${GIT_COMMIT_HASH}", "--no-cache -f Dockerfile.${ENVIRONMENT} .")
                            docker.withRegistry("${DOCKER_REPOSITORY_SERVER}", "${HARBOR_ID}")
                            {
                                docker.image("$REGISTRY/$DOCKERHUB_NAMESPACE/${IMAGE_REPOSITORY}:${SCAPED_BRANCH_NAME}-${GIT_COMMIT_HASH}").push()
                                docker.image("$REGISTRY/$DOCKERHUB_NAMESPACE/${IMAGE_REPOSITORY}:${SCAPED_BRANCH_NAME}-${GIT_COMMIT_HASH}").push("latest")
                            }
                            
                        }
                        catch(e)
                        {
                            PIPELINE_SUCCESS = false
                            ERROR_MESSAGE = "${ERROR_MESSAGE} ${e} \n"
                            print e
                            currentBuild.result = 'FAILURE'
                        }
                    }
                }
            }
        }

        stage ('Init')
        {
            steps
            {
                container('maven') {
                    script
                    {
                        try 
                        {
                            checkout([
                                $class: 'GitSCM', 
                                    branches: [[
                                    name: "*/${BRANCH_DEPLOY}"
                                ]], 
                                doGenerateSubmoduleConfigurations: false, 
                                 extensions: [[
                                    $class: 'CloneOption', 
                                    timeout: 20, 
                                    noTags: false
                                ]], 
                                submoduleCfg: [], 
                                userRemoteConfigs: [[
                                    credentialsId: "${GITLAB_CREDENTIALS_DEPLOY}", 
                                    url: "${GITLAB_REPOSITORY_URL_DEPLOY}"]]
                                ])
                                sh "ls -lart ./*"
                                IMAGE_TAG = sh (script: """
                                    curl -X 'GET' \
                                      '${DOCKER_REPOSITORY_SERVER}/api/v2.0/projects/${PROJECT_NAME}/repositories/${ARTIFACT_PATH}/artifacts?page=1&page_size=1&with_tag=true&with_label=false&with_scan_overview=false&with_signature=false&with_immutable_status=false&with_accessory=false' \
                                      -H 'accept: application/json' \
                                      -H 'X-Accept-Vulnerabilities: application/vnd.scanner.adapter.vuln.report.harbor+json; version=1.0' \
                                      -H 'authorization: Basic ZGV2b3BzOkVJVmdLWFMyQXBLNzNNQXg=' | jq --raw-output '.[0].tags[1].name'
                                """, returnStdout: true).trim()
                        }
                        catch(e)
                        {
                            PIPELINE_SUCCESS = false
                            ERROR_MESSAGE = "${ERROR_MESSAGE} ${e} \n" 
                            print e
                            currentBuild.result = 'FAILURE'
                        }
                    }
                }
            }
        }

        stage ('Pre-Deploy Notification')
        {
            steps
            {
                container('maven') {
                    script
                    {
                        notification("🚀 Deployment Initiated! \n\n Lift Off!")
                    }
                }
            }

        }

        stage("Deploying") 
        {
            steps 
            {
                container('maven') {
                    script 
                    {
                        try {
                            withCredentials([kubeconfigFile(credentialsId: env.KUBECONFIG_CREDENTIAL_ID, variable: 'KUBECONFIG')]) 
                            {
                                sh """
                                helm upgrade -i ${DEPLOYMENT_NAME} ${HELM_PATH} \
                                    --namespace ${NAMESPACE} --create-namespace \
                                    --set initContainer.image.tag="${IMAGE_TAG}"
                                """
                            }
                        }
                        catch(e)
                        {
                            PIPELINE_SUCCESS = false
                            ERROR_MESSAGE = "${ERROR_MESSAGE} ${e} \n"
                            print e
                            currentBuild.result = 'FAILURE'
                        }
                    }
                }
            }
        }

    }

    post
    {
        always
        {
            container('maven') {
                script
                {
                    if (!PIPELINE_SUCCESS)
                    {
                        notification("❗ Build and Deploy Error! \n\n ${ERROR_MESSAGE}")
                    }
                    else
                    {
                        notification("✅ Build and Deploy Success! \n\nThe rocket is now ready to lift off!")
                    }
                    cleanWs()
                }
            }
        }
    }
}

def notification(status)
{
    UNSCAPED_ARTIFACT_PATH = ARTIFACT_PATH.replaceAll('%252F','/')
    sh """
        curl --request POST \
        --url https://api.telegram.org/${BOT_TOKEN}/sendMessage \
        --header 'Accept: application/json' \
        --header 'Content-Type: application/json' \
        --header 'User-Agent: Telegram Bot SDK - (https://github.com/irazasyed/telegram-bot-sdk)' \
        --data '
        {
        "text": "
${status}

${BUILD_TRIGGER_BY}

Project Name: ${PROJECT_NAME}
Application Name: ${APPLICATION_NAME}
Environment: ${ENVIRONMENT}
Branch: ${BRANCH}
Commit Hash: ${GIT_COMMIT_HASH}
Docker Image: ${REGISTRY}/${DOCKERHUB_NAMESPACE}/${IMAGE_REPOSITORY}
Docker Image Tag: ${SCAPED_BRANCH_NAME}-${GIT_COMMIT_HASH}
Artifact Path: ${REGISTRY}/${PROJECT_NAME}/${UNSCAPED_ARTIFACT_PATH}
Build URL: ${BUILD_URL}
            ",
        "disable_web_page_preview": false,
        "disable_notification": ${DISABLE_NOTIFICATION},
        "reply_to_message_id": null,
        "chat_id": "${CHAT_ID}"
        }
        '
    """
}
