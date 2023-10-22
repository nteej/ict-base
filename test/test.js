const fs = require('fs');
const container = require('rhea');

let connection = container.connect({
    host: 'ibusstaging.canadacentral.cloudapp.azure.com',
    port: 33336,
    transport: 'tls',
    cert: fs.readFileSync('./skyplanClientCertificate.pem'),
    key: fs.readFileSync('./skyplanClientPrivateKey.pem'),
    ca: fs.readFileSync('./skyplanClientRootCA.pem'),
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.2',
    rejectUnauthorized: false,
    reconnect: true,
    container_id: 'skyplan-swim'
});

let receiver = connection.open_receiver('SKYPLAN_B-AFTN-SNK');

receiver.on('receiver_open', () => {
    console.log('Receiver link is open.');
});

receiver.on('message', function (context) {
    console.log('Received message:', context.message.body);
});

receiver.on('receiver_error', (context) => {
    console.error('An error occurred in the receiver link:', context.receiver.error);
});

receiver.on('receiver_close', (context) => {
    if (context.receiver.error) {
        console.error('Receiver link closed due to an error:', context.receiver.error);
    }
});

connection.on('connection_open', function () {
    console.log('Connected!');
});

connection.on('connection_error', function (error) {
    console.error('Connection error:', error);
});

connection.on('disconnected', function () {
    console.error('Disconnected from AMQP broker');
});