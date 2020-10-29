pipeline {
  agent {
    label 'docker'
  }
  options {
    disableConcurrentBuilds()
    timeout(time: 60, unit: 'MINUTES')
  }
  tools {
    nodejs '14'
  }
  stages {
    stage ('build') {
        environment {
        RAILS_ENV="test"
        TEST_FILE='test/results.xml' 
        }
      steps {        

        script {          

         docker.image('nikolaik/python-nodejs').inside ("--user=root") {
             sh """
              npm install;
              npm run bootstrap;                        
              git submodule init;
              git submodule update; 
              pip3 install yq;
              apt-get install jq;
              cd packages/cli/;      
              ./test.sh;
            """
          }           
          
        }     
      }     
    }
  }
}

