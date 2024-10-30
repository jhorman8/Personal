const { app } = require('@azure/functions');
const doRequest = require('../handler/httpRequestHandler');
const defaultUrl = 'http://gmapi.azurewebsites.net/getEnergyService'; //TO DO ADD THIS AS AN ENVIRONMENT VARIABLE


async function getBattery(request, context) {
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
    if (!response.body.error && Object.keys(response.body.data).length > 0) {
        const newBody = {
            percent: response.body.data.batteryLevel.value
        };

        return { jsonBody: newBody };
    } else {
        return { jsonBody: response };

    }

}

app.http('battery', {
    methods: ['GET'],
    route: 'vehicles/{id}/battery',
    authLevel: 'anonymous', //key provided for Azure Function resource
    handler: getBattery

});


module.exports = {getBattery}