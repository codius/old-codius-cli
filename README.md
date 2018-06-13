# Codius CLI

> Command Line Interface for Codius

The command line interface for uploading and extending pods on Codius.

## Prerequisites
* NodeJS
* An XRP Wallet (you will need at least 36 XRP to open a new one)
* [Moneyd](https://github.com/interledgerjs/moneyd)

## Installation
The Codius CLI can be installed globally by running the following command:
```
npm install -g codius
```
NOTE: add the `--unsafe-perm` flag if installing as root.

It can then be run with the command `codius`.

## Command Reference
All `codius` commands have a `--help` parameter describing their usage, e.g. `codius upload --help` for help with the `upload` command.
<!---
### `config <manifest>`
Hashes the private variables object in your manifest. The manifest is automatically
updated with the new nonce and hash values. Requires one or more options to do anything.

Arguments:
* `<manifest>`:
   * Type: Object
   * Description: A path to a manifest containing information about your program. Format is described [here](https://github.com/codius/manifest).

| Options                   | Argument Type | Description                                                                      |
|---------------------------|---------------|----------------------------------------------------------------------------------|
| --nonce, -n               | None          | Generates the nonce for the hash of the private variable object in the manifest. |
| --private-var-hash, --pvh | None          | Generates a hash of the private variable object in the manifest.                 |


### `validate <manifest>`
Validates the manifest against the manifest schema as described [here](https://github.com/codius/manifest).

Arguments:
* `<manifest>`
  * Type: Object
  * Description: A path to a manifest containing information about your program. Format is described [here](https://github.com/codius/manifest).

--->

### `hash <manifest>`
Hashes your manifest file. This hash is used as an identifier for the Codius host and the CLI to identify your manifest.

Arguments:
* `<manifest>`
  * Type: Object
  * Description: A path to the manifest containing information about your program. Format is described [here](https://github.com/codius/manifest).

### `upload <manifest>`
Uploads a manifest to a number of Codius hosts. By default it uploads it to a single random known host with a duration of 10 minutes.
Its recommended that you start with a short duration and then extend it to ensure your manifest is running appropriately.

Arguments:
* `<manifest>`
  * Type: Object
  * Description: A path to the manifest containing information about your program. Format is described [here](https://github.com/codius/manifest).

| Options                   | Argument Type | Description                                                                                                                                              |
|---------------------------|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| --duration, -d            | Integer       | Duration (in seconds) by which the contract will be run on all Codius hosts, defaults to 10 mins.                                                        |
| --max-monthly-rate, --max | Integer       | The max rate per month the uploader is willing to pay a Codius host to run the manifest.                                                                 |
| --units, -u               | Integer       | The unit of currency to pay the Codius hosts with. e.g. XRP                                                                                              |
| --host-count, -c          | Integer       | The number of hosts to upload the manifest to. They are discovered from known hosts and selected randomly. This and `--host, -h` are mutually exclusive. |
| --host, -h                | String        | The public URI of a host to upload the manifest to. Can be repeated any number of times. This and `--host-count, -c` are mutually exclusive.             |
| --add-host-env, --add     | Boolean       | Adds a $HOST env in the manifest before upload which contains all the hosts the manifest will be uploaded                                                |
| --no-prompt, --np         | None          | Run without making any prompts to the user.                                                                                                              |

### `extend <manifest>`
Extends the duration of existing contracts.

Arguments:
* `<manifest>`
  * Type: Object
  * Description: The path to the manifest with information about your program. Format is described [here](https://github.com/codius/manifest).

| Options                   | Argument Type | Description                                                                                            |
|---------------------------|---------------|--------------------------------------------------------------------------------------------------------|
| --duration, -d            | Integer       | Duration (in seconds) by which the contract will be extended on all Codius hosts currently running it. |
| --max-monthly-rate, --max | Integer       | The max rate per month the uploader is willing to pay a Codius host to run the manifest.               |
| --units, -u               | Integer       | The unit of currency to pay the Codius hosts with. E.g. XRP                                            |
| --no-prompt, --np         | None          | Run without making any prompts to the user.                                                            |

### `pods`
Retrieves information about the pods uploaded by the codius cli, their hosts and expiration date.

| Options                | Argument Type | Description                                                                       |
|------------------------|---------------|-----------------------------------------------------------------------------------|
| --list, -l             | Boolean       | Lists all pods uploaded by the codius cli, their hash, hosts, and expiration date. |
| --get-pod-manifest, -m | String        | Takes the manifest hash and looks up the raw manifest file used for the pod.      |

### `host`
Modifies the host's local database where peers are stored.

| Options                    | Argument Type | Description                                                               |
|----------------------------|---------------|---------------------------------------------------------------------------|
| --remove-host, -rmhost     | String        | Removes the host passed in as a string from the local Codius CLI db.       |
| --remove-all-hosts, -rmall | Boolean       | Removes all hosts from the local database to reset the peer lookup table. |

## LevelDB
The Codius CLI uses LevelDB to store data about hosts and containers. The LevelDB database is stored in the user's home directory with the name ```.codius-cli ``` by default if ```XDG_CONFIG_HOME``` is not set. For example, the folder will have the following path on a machine running OSX:
```
/Users/<username>/.codius-cli
```
If ```XDG_CONFIG_HOME``` is set the database will simply be named `codius-cli` in that directory.

## License
Apache-2.0
