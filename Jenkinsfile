pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        EXCLUDE_ENTERPRISE = '1'
        SONAR_HOST_URL = 'http://sonarqube:9000'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Server') {
            steps {
                dir('server') {
                    sh '''
                        set -eu
                        go mod download
                        mkdir -p ../bin
                        go test -tags "json1 sqlite3" -count=1 -coverprofile=coverage.out ./...
                        go build -tags "json1 sqlite3" -o ../bin/focalboard-server ./main
                    '''
                }
            }
        }

        stage('Webapp') {
            steps {
                dir('webapp') {
                    sh '''
                        set -eu
                        export CPPFLAGS="-DPNG_ARM_NEON_OPT=0"
                        npm ci --no-optional
                        npm run check
                        npm run test -- --coverage --runInBand
                        npm run pack
                        npm run cypress:ci
                    '''
                }
            }
        }

        stage('Coverage Gate') {
            steps {
                sh '''
                    set -eu
                    node scripts/check-hu-coverage.mjs
                '''
            }
        }

        stage('Sonar Scan') {
            steps {
                sh '''
                    set -eu
                    if [ -n "${SONAR_TOKEN:-}" ]; then
                        sonar-scanner -Dsonar.host.url="$SONAR_HOST_URL" -Dsonar.login="$SONAR_TOKEN"
                    else
                        sonar-scanner -Dsonar.host.url="$SONAR_HOST_URL"
                    fi
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'bin/**, server/coverage.out, webapp/coverage/**, webapp/pack/**', allowEmptyArchive: true, fingerprint: true
        }
    }
}
