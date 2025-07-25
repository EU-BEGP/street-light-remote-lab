
# Street Lights Remote Lab
This hybrid remote lab combines real-time control and ultra-concurrent analysis to enhance lighting engineering education. Students can:
- Control a real street light (adjust intensity, capture sensor data, visualize light distribution).
- Monitor a campus street lighting network to validate compliance with standards.
- Analyze pre-recorded datasets for different lighting scenarios.

Built with ESP32 microcontrollers, MQTT communication, and a web-based interface, the lab connects theory with hands-on practice. Integrated with Book4RLab, it allows easy slot booking for real-time experiments.

<p align="center">
  <img width="1280" height="720" alt="sl_architecture" src="https://github.com/user-attachments/assets/4815db3a-2a1d-4195-9f5e-6f33e2f1e732" />
</p>

## Usage
### Prerequisites

Before getting started, ensure you need to have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your system.

### Components

The project consists of two main components:

-   **RESTful API:** Built using [Django](https://www.djangoproject.com/).
-   **User Interface (UI):** Built using [Angular](https://angular.io/).

### Deployment

The project's containerized architecture ensures easy deployment in a production environment.

You can utilize any container orchestration tool, such as Kubernetes or Docker Swarm, to deploy the services.

Additionally, for efficient handling of HTTP traffic, consider incorporating Nginx into your deployment setup to enhance performance and scalability.

## Authors

 - Boris Pedraza (Universidad Privada Boliviana - UPB)
 - Alfredo Meneses (Universidad Privada Boliviana - UPB)
 - Alex Villazon (Universidad Privada Boliviana - UPB)
 - Omar Ormachea (Universidad Privada Boliviana - UPB)

## Acknowledgments

This work was partially funded by the Erasmus+ Project “EU-BEGP” (No. 101081473).

<p align="center">
  <img width="640" height="360" alt="eu-begp_logo" src="https://github.com/user-attachments/assets/7df4b25a-41e1-4b40-8b54-2532ac051ce0" />
</p>

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## More Information
For more information about the project, please visit our [website](https://eu-begp.org/).
