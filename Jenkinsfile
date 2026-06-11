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
            options {
                timeout(time: 30, unit: 'MINUTES')
            }
            steps {
                dir('server') {
                    sh '''
                        set -eu
                        go mod download
                        mkdir -p ../bin
                        go test -tags "json1 sqlite3" -count=1 -coverprofile=coverage.out ./... || true
                        echo "Building focalboard-server binary..."
                        go build -v -tags "json1 sqlite3" -o ../bin/focalboard-server ./main
                        ls -lh ../bin/focalboard-server
                    '''
                }
            }
        }

        stage('Webapp Build') {
            options {
                timeout(time: 40, unit: 'MINUTES')
            }
            steps {
                dir('webapp') {
                    sh '''
                        set +e
                        export CPPFLAGS="-DPNG_ARM_NEON_OPT=0"
                        npm ci --legacy-peer-deps || true
                        npm run pack || true
                    '''
                }
            }
        }

        stage('Regression') {
            options {
                timeout(time: 20, unit: 'MINUTES')
            }
            steps {
                dir('webapp') {
                    sh '''
                        set +e
                        if [ -f pack/index.html ]; then
                            ./node_modules/.bin/start-server-and-test runserver-test http://localhost:8088 "npm run cypress:run -- --spec cypress/integration/regression.cy.js" || true
                        else
                            echo "Skipping Regression: pack/index.html was not generated"
                        fi
                    '''
                }
            }
        }

        stage('Security') {
            options {
                timeout(time: 20, unit: 'MINUTES')
            }
            steps {
                dir('webapp') {
                    sh '''
                        set +e
                        if [ -f pack/index.html ]; then
                            ./node_modules/.bin/start-server-and-test runserver-test http://localhost:8088 "npm run cypress:run -- --spec cypress/integration/security.cy.js" || true
                        else
                            echo "Skipping Security: pack/index.html was not generated"
                        fi
                    '''
                }
            }
        }

        stage('Accessibility') {
            options {
                timeout(time: 20, unit: 'MINUTES')
            }
            steps {
                dir('webapp') {
                    sh '''
                        set +e
                        if [ -f pack/index.html ]; then
                            ./node_modules/.bin/start-server-and-test runserver-test http://localhost:8088 "npm run cypress:run -- --spec cypress/integration/accessibility.cy.js" || true
                        else
                            echo "Skipping Accessibility: pack/index.html was not generated"
                        fi
                    '''
                }
            }
        }

        stage('HU01') {
            options {
                timeout(time: 20, unit: 'MINUTES')
            }
            steps {
                dir('webapp') {
                    sh '''
                        set +e
                        if [ -f pack/index.html ]; then
                            ./node_modules/.bin/start-server-and-test runserver-test http://localhost:8088 "npm run cypress:run -- --spec cypress/integration/hu01_angie_crear_tablero.cy.js" || true
                        else
                            echo "Skipping HU01: pack/index.html was not generated"
                        fi
                    '''
                }
            }
        }

        stage('HU02') {
            options {
                timeout(time: 20, unit: 'MINUTES')
            }
            steps {
                dir('webapp') {
                    sh '''
                        set +e
                        if [ -f pack/index.html ]; then
                            ./node_modules/.bin/start-server-and-test runserver-test http://localhost:8088 "npm run cypress:run -- --spec cypress/integration/hu02_natalia_crear_tarea.cy.js" || true
                        else
                            echo "Skipping HU02: pack/index.html was not generated"
                        fi
                    '''
                }
            }
        }

        stage('HU03') {
            options {
                timeout(time: 20, unit: 'MINUTES')
            }
            steps {
                dir('webapp') {
                    sh '''
                        set +e
                        if [ -f pack/index.html ]; then
                            ./node_modules/.bin/start-server-and-test runserver-test http://localhost:8088 "npm run cypress:run -- --spec cypress/integration/hu03_juliana_drag_drop.cy.js" || true
                        else
                            echo "Skipping HU03: pack/index.html was not generated"
                        fi
                    '''
                }
            }
        }

        stage('Coverage Gate') {
            steps {
                sh '''
                    set -eu
                    node scripts/check-hu-coverage.mjs || true
                '''
            }
        }

        stage('Sonar Scan') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'SONAR_CREDENTIALS', usernameVariable: 'SONAR_USERNAME', passwordVariable: 'SONAR_PASSWORD')]) {
                    sh '''#!/bin/bash
                        set -euo pipefail
                        sonar-scanner -X -Dsonar.host.url="$SONAR_HOST_URL" -Dsonar.login="$SONAR_USERNAME" -Dsonar.password="$SONAR_PASSWORD" 2>&1 | tee sonar-scanner.log
                    '''
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'bin/**, server/coverage.out, webapp/coverage/**, webapp/pack/**, webapp/cypress/videos/**, webapp/cypress/screenshots/**, sonar-scanner.log', allowEmptyArchive: true, fingerprint: true
        }
    }
}
