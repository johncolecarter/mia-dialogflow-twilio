const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const axios = require('axios');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

app.post('/sms', (req, res) => {
    // const twiml = new MessagingResponse();

    let text = req.body.Body;

    async function getResponse(projectId = 'project-mia-260217') {
        // A unique identifier for the given session
        const sessionId = uuid.v4();

        // Create a new session
        const sessionClient = new dialogflow.SessionsClient();
        const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

        // The text query request.
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    // The query to send to the dialogflow agent
                    text: text,
                    // The language used by the client (en-US)
                    languageCode: 'en-US',
                },
            },
        };

        // Send request and log result
        const responses = await sessionClient.detectIntent(request);
        console.log('Detected intent');
        // console.log(responses)
        const result = responses[0].queryResult;
        console.log(`  Query: ${result.queryText}`);
        console.log(`  Response: ${result.fulfillmentText}`);
        if (result.intent) {
            console.log(`  Intent: ${result.intent.displayName}`);
        } else {
            console.log(`  No intent matched.`);
        }

        headers = {
            "Cashe-Control": "no cache",
            "Content-Type": "application/json",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep alive",
            "Accept": "*/*"
        }

        try {
            await axios.post('https://digital-human.dev.quext.io/api/v1/fulfillment', {
                responseId: responses[0].responseId,
                session: request.session,
                queryResult: {
                    "queryText": result.queryText,
                    "parameters": {
                        "param-name": ""
                    },
                    "allRequiredParamsPresent": true,
                    "fulfillmentText": result.response,
                    "fulfillmentMessages": [
                        {
                            "text": {
                                "text": [
                                    result.response
                                ]
                            }
                        }
                    ],
                    "outputContexts": [
                        {
                            "name": responses[0].queryResult.outputContexts[0].name,
                            "lifespanCount": 5,
                            "parameters": {
                                "param-name": ""
                            }
                        }
                    ],
                    "intent": {
                        "name": responses[0].queryResult.intent.name,
                        "displayName": responses[0].queryResult.intent.displayName
                    },
                    "intentDetectionConfidence": 1,
                    "diagnosticInfo": {},
                    "languageCode": "en"
                },
                originalDetectIntentRequest: {}
            }, {
                headers: headers
            }).then((response) => {

                defaultData = response.data.fulfillmentText
                data = response.data.fulfillmentMessages

                if (typeof response.data.fulfillmentText === 'string') {

                    textMessage = defaultData
                    console.log(defaultData)

                    const textResponse = new MessagingResponse();
                    const message = textResponse.message();
                    message.body(textMessage);

                    res.writeHead(200, { 'Content-Type': 'text/xml' });
                    res.end(textResponse.toString());
                } else {
                    imagesMaxNumber = data.length - 2
                    maxNumber = getRandomInt(imagesMaxNumber)

                    if (maxNumber != 0) {

                        textMessage = data[data.length - 1].text.text[0]
                        image = data[maxNumber].card.imageUri

                        console.log(data[maxNumber].card.imageUri)
                        console.log(data[data.length - 1].text.text[0])

                        const textResponse = new MessagingResponse();
                        const message = textResponse.message();
                        message.body(textMessage);
                        // message.media(image);

                        res.writeHead(200, { 'Content-Type': 'text/xml' });
                        res.end(textResponse.toString());

                    } else {

                        textMessage = data[data.length - 1].text.text[0]
                        console.log(data[data.length - 1].text.text[0])

                        const textResponse = new MessagingResponse();
                        const message = textResponse.message();
                        message.body(textMessage);

                        res.writeHead(200, { 'Content-Type': 'text/xml' });
                        res.end(textResponse.toString());
                    }
                }
            })
        } catch (err) {
            console.log(err)
        }
    }

    getResponse()

});


http.createServer(app).listen(1337, () => {
    console.log('Express server listening on port 1337');
});

// twilio phone-numbers:update "+13465678398" --sms-url="http://localhost:1337/sms"