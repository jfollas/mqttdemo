## MQTT Demo - broker
This is the MQTT broker used in demos.

To run:

- `npm install` to install Mosca and dependencies

Note: Mosca requires a backend for storage/scaling. Mongo is required as the code is currently configured (`sudo service mongodb start`). Other backends are supported (i.e., Redis), so check out the Mosca documentation if you cannot install/use Mongo