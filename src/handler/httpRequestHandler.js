const { default: axios } = require("axios");
const _ = require('lodash');
const DEFAULT_CONFIG = {
    method: 'GET',
    url: '/',
    timeout: 10000,    // 10 seconds timeout
    headers: {
        Accept: 'application/json',
    },
    data: {},
    params: {}
}

async function axios_request(config) {
    try {
        let res = await axios(_.omitBy(_.merge({}, DEFAULT_CONFIG, config), _.isEmpty));

        if (res.data.status === '200' && res.status === 200) {

            return {
                statusCode: res.status,
                body: res.data,
            };
        }else{

            return {
                statusCode: res.status,
                body: {
                    error: {
                        type: 'Error response',
                        data: res.data
                    }
                },
            };

        }

    } catch (err) {
        if (err.response) {
            // The client was given an error response (5xx, 4xx)
            return {
                statusCode: err.response.status,
                body: {
                    error: {
                        type: 'Response with error',
                        message: err.message,
                        data: err.response.data
                    }
                },
            };
        } else if (err.request) {
            // The client never received a response, and the request was never left
            return {
                statusCode: 503,
                body: {
                    error: {
                        type: 'Without response',
                        message: err.message
                    }
                },
            };
        } else {
            // Anything else
            return {
                statusCode: 500,
                body: {
                    error: {
                        type: 'Unhandled error',
                        message: err.message
                    }
                },
            };
        }
    }
}
module.exports = { axios_request };