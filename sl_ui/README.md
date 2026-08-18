# Street Light Remote Lab UI

This is an Angular project that provides an User Interface for the Street Light Remote Laboratory.

## Usage
With the repository already cloned in your system navigate to the *sl_ui* directory:

```
cd street-light-remote-lab/sl_ui/
```

### Environment Setup
To ensure proper configuration of the UI, it's essential to create an environment file named ***.env***. 
This file can be adapted to setup the project either for a *development* or *production* environment.

#### Configuring .env for Development

```
### DOCKER
RESTART_POLICY=no
```
#### Configuring .env for Production

```
### DOCKER
RESTART_POLICY=always
```

#### Environment Variables

The environment variable used for the project is explained in the following table:

| Variable            | Explanation                                                |
|---------------------|------------------------------------------------------------|
| RESTART_POLICY      | Restart policy for Docker containers                       |

### Additional Configuration
#### The `config.json` file

This file holds the UI configuration.

To ensure correct requests, update the `"baseUrl": ""` field to point to your API. Remember, this field may vary based on whether you're using it in a production or development environment.
| Development Environment | Production Environment |
|--|--|
| `"baseUrl": "http://localhost:8000/",` | `"baseUrl": "https://<domain_name>/street-light-rl/api/",` |

#### The Dockerfile

The `Dockerfile` builds with `ng build` and no `--base-href` override, so the image
serves correctly at the root path for local/development use. For a **production**
deployment behind a subpath, add the `--base-href` flag back to that line, matching
your reverse-proxy path.

### Running the Project

Once the environment setup is done you can run the project following the next steps:

 - Build the docker image running the following command:

	``` 
	docker-compose build 
	```

 - Run UI:
  
	``` 
	docker-compose up 
	```
