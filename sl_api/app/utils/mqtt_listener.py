from time import sleep
import json
import paho.mqtt.client as mqtt


class MQTTListener:
    def __init__(self, name, host, port, user, password, topic, message_handler):
        self.name = name
        self.mqtt_host = host
        self.mqtt_port = port
        self.mqtt_user = user
        self.mqtt_pwd = password
        self.mqtt_topic = topic
        self.message_handler = message_handler
        self.client = mqtt.Client()

        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_message = self.on_message
        self.client.username_pw_set(self.mqtt_user, self.mqtt_pwd)

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print(f"[{self.name} MQTT Listener]: Connected to MQTT broker")
            client.subscribe(self.mqtt_topic)
        else:
            print(
                f"[{self.name} MQTT Listener]: Failed to connect to MQTT broker. Error code:",
                rc,
            )

    def on_disconnect(self, client, userdata, rc):
        print("Disconnected from MQTT broker. Return code:", rc)

        if rc != 0:  # Non-zero return code indicates abnormal disconnection
            while True:
                try:
                    client.reconnect()
                    print(f"{self.name} [MQTT Listener]: Reconnected to MQTT broker.")
                    break
                except Exception as e:
                    print(
                        f"[{self.name} MQTT Listener]: Reconnect failed: {e}. Retrying in 5 seconds..."
                    )
                    sleep(5)

    def on_message(self, client, userdata, msg):
        try:
            # Get and parse MQTT message
            mqtt_message = json.loads(msg.payload.decode())
            self.message_handler(mqtt_message)

        except json.JSONDecodeError:
            print(
                f"{self.name} MQTT Listener]: Failed to decode JSON from message: {msg.payload}"
            )
        except Exception as e:
            print(f"[{self.name} MQTT Listener]: An error occurred: {e}")

    def start(self):
        while True:
            try:
                self.client.connect(self.mqtt_host, int(self.mqtt_port), 60)
                self.client.loop_forever()  # This will block and handle messages
                break  # Exit the loop if connection is successful
            except Exception as e:
                print(f"[{self.name} MQTT Listener]: {e}. Retrying...")
                sleep(5)
