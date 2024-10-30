const { app } = require('@azure/functions');
const doRequest = require('../handler/httpRequestHandler');
const defaultUrl = 'http://gmapi.azurewebsites.net/getSecurityStatusService';

async function getSecurity(request, context) {
    const id = request.params.id;

    let options = {
        method: 'POST',
        url: defaultUrl,
        data: {
            id: id,
            responseType: "JSON"
        },
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const response = await doRequest.axios_request(options);
    if (!response.body.error) {
        const values = response.body.data.doors.values;
        let newBody = {};
        let result = [];
        values.forEach(element => {
            newBody = {
                location: element.location.value,
                locked: element.locked.value
            }
            result.push(newBody);
        });
        return { jsonBody: result };
    } else {
        return { jsonBody: response };

    }



}


app.http('security', {
    methods: ['GET'],
    route: 'vehicles/{id}/doors',
    authLevel: 'anonymous', //key provided for Azure Function resource
    handler: getSecurity
});

module.exports = { getSecurity }