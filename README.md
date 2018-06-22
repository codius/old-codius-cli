# Codius CLI
> Command Line Interface for Codius

[![NPM Package](https://img.shields.io/npm/v/codius.svg?style=flat)](https://npmjs.org/package/codius)
[![CircleCI](https://circleci.com/gh/codius/codius.svg?style=shield)](https://circleci.com/gh/codius/codius)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

The Command Line Interface for uploading and extending pods on Codius.

<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-refresh-toc -->
**Table of Contents**

- [Codius CLI](#codius-cli)
    - [Overview](#overview)
    - [Upgrade Notes](#upgrade-notes)
        - [Listing all uploaded pods](#listing-all-uploaded-pods)
        - [Exporting a manifest](#exporting-a-manifest)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Command Reference](#command-reference)
        - [`upload [options]`](#upload-options)
        - [`extend [options]`](#extend-options)
        - [`extend-hash <hash> [options]`](#extend-hash-hash-options)
    - [How to Use](#how-to-use)
        - [Terms](#terms)
        - [Background](#background)
        - [Example Files](#example-files)
        - [Uploading a Pod](#uploading-a-pod)
            - [Upload to a specific host](#upload-to-a-specific-host)
            - [Upload to X random hosts](#upload-to-x-random-hosts)
            - [Upload to 2+ specific hosts](#upload-to-2-specific-hosts)
        - [Extending a Pod](#extending-a-pod)
            - [Extend with same parameters as upload](#extend-with-same-parameters-as-upload)
            - [Extend with different parameters](#extend-with-different-parameters)
        - [Extending a Pod by Manifest Hash](#extending-a-pod-by-manifest-hash)
            - [Extend by Hash & Host](#extend-by-hash--host)
            - [Extend by Pod Url](#extend-by-pod-url)
        - [Advanced Features](#advanced-features)
            - [Manually Editing `*.codiusstate.json` files](#manually-editing-codiusstatejson-files)
            - [Codius Hosts File](#codius-hosts-file)
            - [Migrating Existing Manifests](#migrating-existing-manifests)
            - [Debugging](#debugging)
    - [License](#license)

<!-- markdown-toc end -->

## Overview
The Codius CLI supports uploading & extending pods on codius hosts.

## Upgrade Notes
If upgrading from Codius CLI 2.0.x please note that the LevelDB dependency is removed the list of currently uploaded **pods** and **stored manifests** will be inaccessible.
It's recommended that the list of pods and any manifests that are only stored in the Codius CLI be exported before upgrading.

### Listing all uploaded pods
Use the command
```
codius pods -l
```
to list all pods that have been uploaded. Redirect this command to a file to save the list. For example
```
codius pods -l > myPodList.json
```

### Exporting a manifest
To export a manifest that is only stored in the Codius CLI from the LevelDB use the command
```
codius pods -m [manifestHash]
```
For example the following will export the pod with the manifest hash `s5e3eqgzy4eqvsejphru6y62uw325nj7tvqr7a2pqxohtkcd6wj` to the file `s5e3eqgz-manifest-backup.json`

```
codius pods -m s5e3eqgzy4eqvsejphru6y62uw325nj7tvqr7a2pqxohtkcd6wjq > s5e3eqgz-manifest-backup.json
```
Repeat the command above for all the manifests that need to be preserved so the pods can be kept running or uploaded to a new host.

## Prerequisites

* NodeJS
* An XRP Wallet (you will need at least 20 XRP to open a new one)
* [Moneyd](https://github.com/interledgerjs/moneyd)

## Installation
The Codius CLI can be installed globally by running the following command:
```
npm install -g codius
```
It can then be run with the command `codius`.

## Command Reference
All `codius` commands have a `--help` parameter describing their usage, e.g. `codius upload --help` for help with the `upload` command.

### `upload [options]`
Looks in the current directory for the files `codius.json` & `codiusvars.json` which are used to generate a manifest.
The generated manifest is then used to upload the pod to host(s). By default it uploads the pod to a single random known host with a
duration of 10 minutes. It's recommended that you start with a short duration and then extend it to ensure your
manifest is running appropriately. Upload should only be used for new manifest where a `default.codiusstate.json` file does not exist.

| Options                      | Argument Type | Description                                                                                                                                                     |
|------------------------------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| --duration, -d               | Integer       | Duration (in seconds) the pod will be run on all Codius hosts, defaults to 10 mins.                                                                             |
| --max-monthly-rate, -m       | Integer       | Max rate per month the uploader is willing to pay a Codius host to run the pod, requires --units flag to be set. Defaults to 10.                                |
| --units, -u                  | Integer       | The unit of currency to pay the Codius hosts with, e.g. 'XRP', requires --max-monthly-rate flat to be set. Defaults to 'XRP'.                                                                                |
| --host-count, -c             | Integer       | The number of hosts to upload the pod to. They are discovered from known hosts and selected randomly. Defaults to 1. This and `--host` are mutually exclusive.  |
| --host                       | String        | The public URI of a host to upload the manifest to. Can be repeated any number of times for multiple hosts. This and `--host-count, -c` are mutually exclusive. |
| --add-host-env, --a          | Boolean       | Adds a $HOST env in the manifest before upload which contains all the hosts the manifest will be uploaded to.                                                   |
| --codius-file                | String        | Filename or full path to codius file to be used. If not set the CLI looks in the current directory for the codius.json file.                                    |
| --codius-vars-file           | String        | Filename or full path to the codius variables file to be used. If not set the CLI looks in the current directory for the codiusvars.json file.                  |
| --codius-hosts-file          | String        | Filename or full path to the codius hosts file to be used. If not set the CLI looks in the current directory for the codiushosts.json file.                     |
| --codius-state-file          | String        | Filename or full path to the codius state file to be generated. If not set the CLI will make a default.codiusstate.json file.                                   |
| --overwrite-codius-state, -o | Boolean       | Overwrite the current *.codiusstate.json file if it exists.                                                                                                     |
| --assume-yes, -y             | Boolean       | Say yes to all prompts.                                                                                                                                         |

### `extend [options]`
Used to manage the pod after the initial upload. It extends the duration of a running pod or uploads the pod again if the pod has expired.
Extend can only be used after a `default.codiusstate.json` file exists in the current directory.
The upload command is used to generate that file. When run successfully the `*.codiusstate.json` file will be updated.

| Options                   | Argument Type | Description                                                                                            |
|---------------------------|---------------|--------------------------------------------------------------------------------------------------------|
| --duration, -d               | Integer       | Duration (in seconds) the pod will be run on all Codius hosts, defaults to 10 mins.                                                                             |
| --max-monthly-rate, -m       | Integer       | Max rate per month the uploader is willing to pay a Codius host to run the pod, requires --units flag to be set. Defaults to 10.                                |
| --units, -u                  | Integer       | The unit of currency to pay the Codius hosts with, e.g. 'XRP', requires --max-monthly-rate flat to be set. Defaults to 'XRP'.                                                                                |
| --codius-state-file          | String        | Filename or full path to the codius state file to be generated. If not set the CLI will make a default.codiusstate.json file.                                   |
| --assume-yes, -y             | Boolean       | Say yes to all prompts.                                                                                                                                         |

### `extend-hash <hash> [options]`
Extends a pod using the provided manifest hash on the host. Allows the user to extend a pod if they know the manifest hash and the host.
Useful if the user is not the one who generated the original manifest but wishes to keep it running.

Arguments:
* `<manifest-hash>`
  * Type: String
  * Description: The manifest hash of the manifest to extend.

| Options                   | Argument Type | Description                                                                                            |
|---------------------------|---------------|--------------------------------------------------------------------------------------------------------|
| --duration, -d               | Integer       | Duration (in seconds) the pod will be run on all Codius hosts, defaults to 10 mins.                                                                             |
| --max-monthly-rate, -m       | Integer       | Max rate per month the uploader is willing to pay a Codius host to run the pod, requires --units flag to be set. Defaults to 10.                                |
| --units, -u                  | Integer       | The unit of currency to pay the Codius hosts with, e.g. 'XRP', requires --max-monthly-rate flat to be set. Defaults to 'XRP'.                                   |
| --codius-state-file          | String        | Filename or full path to the codius state file to be generated. If not set the CLI will make a default.codiusstate.json file.                                   |
| --assume-yes, -y             | Boolean       | Say yes to all prompts.                                                                                                                                         |

## How to Use
### Terms
 * **Codius File**: File named `codius.json` which contains the main details of the manifest along with variable place holders to be
 interpolated with the actual values in the  `codiusvars.json` file.
 * **Codius Vars File**: File named `codiusvars.json` which contains the public and private variables which will be interpolated with
 the `codius.json` file to generate the full manifest.
 * **Codius State File**: File named `default.codiusstate.json` which is created by the upload command on successful upload to at least one host.
 This file contains the generated interpolated manifest, the hosts its been uploaded to, and details about when the pod expires on those hosts.

### Background
Codius CLI uses a directory per manifest approach where each manifest is composed of 2 files `codius.json` & `codiusvars.json`.
The upload command uses these 2 files and through interpolation generates the codius manifest for upload to a host.
By default the upload command looks for those files in its current directory.
Once uploaded the generated manifest is stored locally in a `default.codiusstate.json` file.
This file contains all the information needed to extend and manage the generated manifest.

Manifests should be stored on a per folder basis and be broken up into a `codius.json` & `codiusvars.json` files.
An example folder structure is how the [Codius Examples](https://github.com/codius/examples) repo is setup.
```
examples
├── host-list
│   ├── codius.json
│   └── codiusvars.json
├── nginx
│   ├── codius.json
│   └── codiusvars.json
├── quake
│   ├── codius.json
│   └── codiusvars.json
└── react-app
    ├── codius.json
    └── codiusvars.json
```
This setup allows the user to save the `codius.json` & `codiusvars.json` in any version control software.
The `codius.json` file can then be shared with anyone without exposing the private or public variables used
by your application. After upload the `default.codiusstate.json` file will be created in the folder which
can also be added to version control to keep track of the generated manifest and where the pods are running.

After uploading the 4 apps above from the examples the folder structure would look as follows.
```
examples
├── host-list
│   ├── codius.json
│   ├── codiusvars.json
│   └── default.codiusstate.json
├── nginx
│   ├── codius.json
│   ├── codiusvars.json
│   └── default.codiusstate.json
├── quake
│   ├── codius.json
│   ├── codiusvars.json
│   └── default.codiusstate.json
└── react-app
    ├── codius.json
    ├── codiusvars.json
    └── default.codiusstate.json
```

### Example Files

 **codius.json**
 ```javascript
 {
  "manifest": {
    "name": "nginx-codius-pod",
    "version": "1.0.0",
    "machine": "small",
    "port": "80",
    "containers": [{
      "id": "app",
      "image": "nginx@sha256:3e2ffcf0edca2a4e9b24ca442d227baea7b7f0e33ad654ef1eb806fbd9bedcf0",
      "command": ["nginx", "-g", "daemon off;"],
      "workdir": "/root",
      "environment": {
        "EXAMPLE_PUBLIC_ENV": "$EXAMPLE_PUBLIC_ENV",
        "EXAMPLE_PRIVATE_ENV": "$EXAMPLE_PRIVATE_ENV"
      }
    }]
  }
}
 ```

 **codiusvars.json**
```javascript
{
  "vars": {
    "public": {
      "EXAMPLE_PUBLIC_ENV": {
        "value": "Public Env Value"
      }
    },
    "private": {
      "EXAMPLE_PRIVATE_ENV": {
        "value": "Private Env Value",
    "nonce": "jklnfgwekltfhj4io23r89o"
      }
    }
  }
}
```

**empty codiusvars.json**
```javascript
{
  "vars": {
    "public": {},
    "private": {}
  }
}
```

### Uploading a Pod
To upload a pod create a folder which contains 2 files a `codius.json` and `codiusvars.json`.
The `codius.json` file contains the details about the container and all the main contents of the pod.
The `codiusvar.json` file contains the variables which will be interpolated with the `codius.json` file to create
the generated manifest.

*NOTE:* The `codiusvars.json` file is required even if there are no variables to be interpolated.
When running the Codius CLI it will prompt you in the case of a missing `codiusvars.json` file and generate
one with no variables present.

Examples of pods can be found in the [Codius Examples](https://github.com/codius/examples) repo.

#### Upload to a specific host
Description: *Generates the manifest and uploads a pod to the specified host.*
Parameters:
 * Host: `https://codius.example.com`
 * Duration: `600` seconds (10 Mins)
```
codius upload --host https://codius.example.com -d 600
```

#### Upload to X random hosts
Description: *Generates the manifest and uploads a pod 5 random hosts.*
Parameters:
 * Host Count: `5`
 * Duration: `600` seconds (10 Mins)
 ```
codius upload -c 5 -d 600
 ```

#### Upload to 2+ specific hosts
Description: *Generates the manifest and uploads a pod to 2 specific hosts.*
Parameters:
 * Hosts: `https://codius.example.com`, `https://codius.example2.com`
 * Duration: `600` seconds (10 Mins)
```
codius upload --host https://codius.example.com --host https://codius.example2.com -d 600
```

### Extending a Pod
Extend supports managing the pod once it has been uploaded successfully. This is done through the `default.codiusstate.json` file.
To extend as pod there must be a `default.codiusstate.json` file present. This file is generated during
the upload step and contains the generated manifest, hosts uploaded to, and the status of when the current
running pod expires on those hosts.

#### Extend with same parameters as upload
Description: *Extends the pod with the same parameters as used during the initial upload or last extend.*
Parameters:
 * None
```
codius extend
```

#### Extend with different parameters
Description: *Extends the pod with the passed in parameters.*
Parameters:
 * Duration: `600` seconds (10 Mins)
 * Max Monthly Rate: `10`
 * Units: `XRP`
```
codius extend -d 600 -m 10 -u XRP
```

### Extending a Pod by Manifest Hash
If the manifest hash and the host where the pod is running is known the pods runtime can be extended using the `extend-hash` command.
NOTE: *The pod must be running in order to be able to extend it. If its expired `extend-hash` will not work.*

#### Extend by Hash & Host
Description: *Extend the running pod on the host by its manifest hash.*
Parameters:
 * Host: 'https://codius.example.com'
 * Duration: `600` seconds (10 Mins)
 * Max Monthly Rate: `10`
 * Units: `XRP`
 ```
extend-hash hyg2qziqlhdogtbxm347spzrwkibgbzdalyj2qavqra4gzmm5jzq --host https://codius.example.com -d 600 -m 10 -u XRP
 ```

#### Extend by Pod Url
Description: *Extends the running pod on the host using its full URL.*
Parameters:
 * Duration: `600` seconds (10 Mins)
 * Max Monthly Rate: `10`
 * Units: `XRP`
```
extend-hash https://hyg2qziqlhdogtbxm347spzrwkibgbzdalyj2qavqra4gzmm5jzq.codius.example.com -d 600 -m 10 -u XRP
```

### Advanced Features

#### Manually Editing `*.codiusstate.json` files
The `*.codiusstate.json` file consists of the following properties
 * **description** Used for notes about the file, not used by the Codius CLI. Can be manually modified.
 * **manifestHash** The manifest hash of the manifest in the generatedManifest.manifest property. **DO NOT MANUALLY MODIFY**
 * **generatedManifest** The generated manifest from the `codius upload` command. **DO NOT MANUALLY MODIFY**
 * **options** The options used for the last `upload` or `extend` command. Can be manually modified.
 * **hostList** The list of hosts that was used in the last `upload` or `extend` command. Can be manually modified to remove or add a host.
   * NOTE: If you are using the **HOST environment variable** this should not be modified since you cannot modify the generatedManifest section manually
   to add or remove a host. You must use the `upload` command to regenerate the manifest with any updated HOSTS since it will change the manifest hash.
 * **status** The current known status of the pod on the hosts it was uploaded to. It should not be manually modified
 but if you remove a host from the hostList you may want to remove its associated status key as well. Its used to make the Codius CLI more informative
 when extending a pod.


#### Codius Hosts File
In your manifest directory optionally a `codiushosts.json` file may be included which contains a list of hosts which should be used for upload.
If the `--host-count` option is used the # of hosts will be randomly selected from those in this file. If that option is not specified then
the pod will attempt to upload to all hosts in the `codiushosts.json` file.

**codiushost.json**
```javascript
{
  "hosts":["https://codius.example.com","https://codius.example2.com"]
}
```

#### Migrating Existing Manifests
Existing manifest should be migrated to the new format by splitting the main manifest and the variables
into the `codius.json` and `codiusvars.json` files. Unfortunately this means that the generated manifest will change slightly
and so will the manifest hash. If that is not tenable please stick with using the Codius CLI 2.0.x.

To migrate the existing manifest to the new format first look at the existing manifests `manifest` object.
Copy it into a new file `codius.json` and remove the `vars` object from the manifest object.

Make a new `codiusvars.json` file which looks like the example in the [Example Files:](#example-files) section with the private
and public variables that were in the original manifests `vars` and `private` objects.

Once that is complete the manifest is ready to be uploaded with the new Codius CLI.
Run upload which will combine the 2 files and generate a manifest with the private variables
hashed

#### Debugging
If the Codius CLI is not working as expected debugging can be enabled by adding `DEBUG=codius-cli*` to the beingging of the `codius` command. E.g.
```
DEBUG=codius-cli* codius
```

If that does not provide enough detail, all debug output can be enabled by using `DEBUG=*`.


## License
Apache-2.0
