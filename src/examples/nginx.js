/**
 * @fileOverview nginx codius manifest example
 * @name nginx.js
 * @author Travis Crist
 */

function codius () {
  return {
    manifest: {
      name: 'nginx-codius-pod',
      version: '1.0.0',
      machine: 'small',
      port: '80',
      containers: [{
        id: 'app',
        image: 'nginx@sha256:3e2ffcf0edca2a4e9b24ca442d227baea7b7f0e33ad654ef1eb806fbd9bedcf0',
        command: ['nginx', '-g', 'daemon off;'],
        workdir: '/root',
        environment: {
          EXAMPLE_PUBLIC_ENV: '$EXAMPLE_PUBLIC_ENV',
          EXAMPLE_PRIVATE_ENV: '$EXAMPLE_PRIVATE_ENV'
        }
      }]
    }
  }
}

function codiusVars () {
  return {
    vars: {
      public: {
        EXAMPLE_PUBLIC_ENV: {
          value: 'Public Env Value'
        }
      },
      private: {
        EXAMPLE_PRIVATE_ENV: {
          value: 'Private Env Value'
        }
      }
    }

  }
}

module.exports = {
  codius,
  codiusVars
}
