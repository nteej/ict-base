const fs = require('fs');
var container = require('rhea');
const { v4: uuidv4 } = require('uuid');

let message = {
    "priority": "GG",
    "from": "CYYCXXSA",
    "to": ["CYYCXXSA", "CYULYFYX"],
    "filingTime": "140335",
    "timestamp": "2023-07-04T12:32:00Z",
    "payload": [
        "TEST MESSAGE LOOPBACK CHECK"
    ]
};



let connection = container.connect({
    host: 'ibusstaging.canadacentral.cloudapp.azure.com',
    port: 33336,
    transport: 'tls',
    cert: fs.readFileSync('/var/www/navcan/skyplanClientCertificate.pem'),
    key: fs.readFileSync('/var/www/navcan/skyplanClientPrivateKey.pem'),
    ca: fs.readFileSync('/var/www/navcan/skyplanClientRootCA.pem'),
    minVersion: 'TLSv1.2', // Set minimum TLS version to 1.2
    maxVersion: 'TLSv1.2', // Set maximum TLS version to 1.2
    rejectUnauthorized: false, // Set this to true to enforce certificate validation
    reconnect: true,
    container_id: 'skyplan-swim-pub',
    tls: { ciphers: 'AES256-SHA256' }
});

let sender;

container.on('connection_open', function (context) {
    console.log('Connected!');

    // create a sender

    sender = context.connection.open_sender('topic://SKYPLAN/AFTNRELAY/CYYCXXSA/');

    // send a message^
    sender.send({
        body: JSON.stringify(message), // Convert the message payload to a JSON string
        application_properties: {
            MSG_TYPE: "AFTN_MESSAGE", // Constant value
            MSG_ID: uuidv4(), // Universally Unique Identifier message id
            MSG_ORIGINATOR: "SKYPLAN", // Coordinate with NAVCANHub team to set the value
            MSG_PUBLISH_TIME: new Date().toISOString(), // The timestamp of the message, format: ISO 8601:2019
            DESTINATION: "SKYPLAN/AFTNRELAY/CYYCXXSA/", // Topic address, replace with the correct destination topic
            DESTINATION_TYPE: "Topic", // Constant value
            MSG_AFTN_PAYLOAD_TYPE: "JSON" // Source payload type, either "TEXT" or "JSON"
        },
        ttl: 21600 * 1000 // Time to live in milliseconds
    });


    //context.connection.close();



    sender.on('accepted', () => {
        console.log('Message accepted by the broker.');
        context.connection.close();
    });

    sender.on('rejected', (context) => {
        console.log('Message rejected by the broker:', context.sender.error);
        context.connection.close();
    });

    sender.on('sender_error', (context) => {
        console.error('An error occurred while sending the message:', context.sender.error);
    });

    sender.on('sender_close', (context) => {
        if (context.sender.error) {
            console.error('Sender closed due to an error:', context.sender.error);
        }
    });
});

container.on('error', (context) => {
    console.log('Error:', context.error ? context.error : context);
});

container.on('connection_error', (context) => {
    console.log('Connection error:', context.error ? context.error : context);
});

container.on('disconnected', (context) => {
    console.log('Disconnected from AMQP broker:', context.error ? context.error : context);
});
process.on('exit', (code) => {
    console.log(`About to exit with code: ${code}`);
    if (sender) {
        sender.close();
        console.log('sender closed');
    }
    if (connection) {
        connection.close();
        console.log('Connection closed');
    }
});

process.on('SIGINT', () => {
    console.log('Caught interrupt signal, exiting...');
    if (sender) {
        sender.close();
        console.log('sender closed');
    }
    if (connection) {
        connection.close();
        console.log('Connection closed');
    }
    process.exit(); // This is necessary because a SIGINT event doesn't necessarily cause the process to exit
});
// Delay the script from exiting immediately
setTimeout(() => {
    console.log('Exiting the script...');
    process.exit(0);
}, 20000); // Adjust the delay time as needed