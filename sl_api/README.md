# Street Light Remote Laboratory API

This is a Django project that provides an API.
The API allows users to manage the elements of the project via API calls or using the Django Admin Panel.

## Usage

With the repository already cloned in your system navigate to the *sl_api* directory:

```
cd street-light-remote-lab/sl_api/
```

### Environment Setup

To ensure proper configuration of the API, it's essential to create an environment file named ***.env***. 
This file will contain important environment variables necessary for seamless project execution.

This file can be adapted to setup the project either for a *development* or *production* environment.

#### Configuring .env for Development

```
ENVIRONMENT=development

### APP
DEBUG=1
SECRET_KEY='<secret_key:string>'
TRUSTED_HOSTS=localhost
TRUSTED_ORIGINS=http://localhost:<port>
FORCE_SCRIPT_NAME=/
DB_HOST=db
DB_NAME=<db_name:string>
DB_USER=<db_user:string>
DB_PASSWORD=<db_password:string>
STATIC_URL=/static/
EMAIL_HOST_USER=<email_host:string>
EMAIL_HOST_PASSWORD=<email_passwod:string>

UI_BASE_URL=http://localhost:<port>/

### DB
POSTGRES_DB=<db_name:string>
POSTGRES_USER=<db_user:string>
POSTGRES_PASSWORD=<db_user:string>

### MQTT
MQTT_HOST=<mqtt_host:string>
MQTT_PUB_GRID_TOPIC=<mqtt_grid_topic:string>
MQTT_PUB_LIGHT_TOPIC=<mqtt_light_topic:string>
MQTT_SUB_TOPIC=<mqtt_data_topic:string>
MQTT_PORT=<mqtt_port:int>

### DOCKER
RESTART_POLICY=no
```

#### Configuring .env for Production

```
ENVIRONMENT=production

### APP
DEBUG=0
SECRET_KEY='<secret_key:string>'
TRUSTED_HOSTS=<domain_name_hosts:string>
TRUSTED_ORIGINS=<full_url_origins:string>
FORCE_SCRIPT_NAME=/street-light-rl/api
DB_HOST=db
DB_NAME=<db_name:string>
DB_USER=<db_user:string>
DB_PASSWORD=<db_password:string>
STATIC_URL=/street-light-rl/api/static/
EMAIL_HOST_USER=<email_host:string>
EMAIL_HOST_PASSWORD=<email_passwod:string>

UI_BASE_URL=<ui_full_url:string>

### DB
POSTGRES_DB=<db_name:string>
POSTGRES_USER=<db_user:string>
POSTGRES_PASSWORD=<db_user:string>

### MQTT
MQTT_HOST=<mqtt_host:string>
MQTT_PUB_GRID_TOPIC=<mqtt_grid_topic:string>
MQTT_PUB_LIGHT_TOPIC=<mqtt_light_topic:string>
MQTT_SUB_TOPIC=<mqtt_data_topic:string>
MQTT_PORT=<mqtt_port:int>

### DOCKER
RESTART_POLICY=always
```

#### Environment Variables

> **Note:** Replace the values of the strings starting with `<` and ending with `>` in your configuration with your own values.

The environment variables used for the project are explained in the following table:

| Variable            | Explanation                                                |
|---------------------|------------------------------------------------------------|
| `ENVIRONMENT`       | Specifies the environment where the application is running (e.g., `production`, `development`). |
| `DEBUG`             | Controls debugging behavior; `0` for debugging off (recommended in production). |
| `SECRET_KEY`        | Secret key used for cryptographic operations and security purposes. Must be kept confidential. |
| `TRUSTED_HOSTS`     | Comma-separated list of domain names or IP addresses allowed to access the Django application (e.g., `example.com,www.example.com`). |
| `TRUSTED_ORIGINS`   | Comma-separated list of full URLs (including `http://` or `https://`) allowed for cross-origin requests and trusted for CSRF protection (e.g., `https://example.com,https://sub.example.com`). |
| `FORCE_SCRIPT_NAME` | URL prefix for the application, useful when the application is served from a subpath (e.g., `/street-light-rl/api`). |
| `STATIC_URL`        | Base URL for serving static files (e.g., `/street-light-rl/api/static/`). |
| `UI_BASE_URL`       | Base URL for the application's user interface (e.g., `https://example.com/ui/`). |
| `DB_HOST`           | Hostname or IP address of the database server (e.g., `db`). |
| `DB_NAME`           | Name of the database to connect to within the database server (e.g., `mydatabase`). |
| `DB_USER`           | Username for authenticating to the database server (e.g., `dbuser`). |
| `DB_PASSWORD`       | Password for authenticating to the database server (e.g., `mypassword`). |
| `POSTGRES_DB`       | Name of the PostgreSQL database (should match `DB_NAME` for consistency). |
| `POSTGRES_USER`     | Username for authenticating to the PostgreSQL database (should match `DB_USER`). |
| `POSTGRES_PASSWORD` | Password for authenticating to the PostgreSQL database (should match `DB_PASSWORD`). |
| `MQTT_HOST`         | Hostname or IP address of the MQTT broker. |
| `MQTT_PUB_GRID_TOPIC` | MQTT topic for publishing grid-related data. |
| `MQTT_PUB_LIGHT_TOPIC` | MQTT topic for publishing light-related data. |
| `MQTT_SUB_TOPIC`    | MQTT topic for subscribing to data. |
| `MQTT_PORT`         | Port number for connecting to the MQTT broker. |
| `RESTART_POLICY`    | Docker restart policy for containers, which controls when Docker should automatically restart the container (e.g., `always`, `no`). |

- To generate your own `SECRET_KEY`, run the following command:

    ```bash
    docker-compose run --rm app sh -c 'python manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"'
    ```

- To set up email messaging functionality, insert your **email account name** and **app password** into the specified environment variables. Note that your usual password won't work; you need to generate an app password.

  Learn how to create an app password for your Google account by following [this guide](https://knowledge.workspace.google.com/kb/how-to-create-app-passwords-000009237).

### Running the Project

Once the environment setup is done you can run the project following the next steps:

 - Build the docker images for Django and Postgres running the following command:

	``` 
	docker-compose build 
	```

 - Propagate changes to database:
  
	``` 
	docker-compose run --rm app sh -c "python manage.py makemigrations"
	docker-compose run --rm app sh -c "python manage.py migrate"
	``` 

 - Create superuser for the admin panel (If needed):

	``` 
	docker-compose run --rm app sh -c "python manage.py createsuperuser"
	``` 

 - Run API:
  
	``` 
	docker-compose up 
	```
 
	> The Django Admin Panel will be available in the path <API_URL>/admin/

## Recommendations

While running in production, do not forget that in order to serve static files, such as images or stylesheets, you will need to configure your HTTP server to serve static files from Django.

First, you need to run the following command to collect the static files:

``` 
docker-compose run --rm app sh -c "python manage.py collectstatic"
```

This will collect all static files from the application and place them in a directory that can be served by your HTTP server.

Then, you need to configure your HTTP server to serve static files from this directory. The specific configuration will depend on the HTTP server you are using.
