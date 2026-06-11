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

        /* stage('Server') {
            options {
                timeout(time: 30, unit: 'MINUTES')
            }
            steps {
                dir('server') {
                    sh '''
                        set -eu
                        go mod download
                        mkdir -p ../bin
                        go test -tags "json1 sqlite3" -count=1 -coverprofile=coverage.out ./...
                        echo "Building focalboard-server binary..."
                        go build -v -tags "json1 sqlite3" -o ../bin/focalboard-server ./main
                        ls -lh ../bin/focalboard-server
                    '''
                }
            }
        } */

        stage('Webapp') {
            options {
                timeout(time: 40, unit: 'MINUTES')
            }
            steps {
                dir('webapp') {
                    
                    sh '''
                        set +e
                        export CPPFLAGS="-DPNG_ARM_NEON_OPT=0"
                        npm ci --legacy-peer-deps || true
                        npm install --no-save --package-lock=false --legacy-peer-deps @swc/core@^1.2.177 || true
                        npm run test -- --coverage --runInBand || true
                        npm run pack || true
                        npm run cypress:ci || true
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
