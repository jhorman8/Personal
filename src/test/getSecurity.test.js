const { getSecurity } = require('../functions/getSecurity'); 
const doRequest = require('../handler/httpRequestHandler'); 

// Mocking doRequest.axios_request method
jest.mock('../handler/httpRequestHandler');

describe('getSecurity Function', () => {
    const context = {}; // Mock context if needed

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return door security information when response is successful', async () => {
        // Mock successful response from doRequest.axios_request
        doRequest.axios_request.mockResolvedValue({
            body: {
                error: false,
                data: {
                    doors: {
                        values: [
                            { location: { value: 'frontLeft' }, locked: { value: true } },
                            { location: { value: 'frontRight' }, locked: { value: false } }
                        ]
                    }
                }
            }
        });

        const request = { params: { id: '1' } };
        const result = await getSecurity(request, context);

        expect(result).toEqual({
            jsonBody: [
                { location: 'frontLeft', locked: true },
                { location: 'frontRight', locked: false }
            ]
        });
        expect(doRequest.axios_request).toHaveBeenCalledTimes(1);
        expect(doRequest.axios_request).toHaveBeenCalledWith({
            method: 'POST',
            url: 'http://gmapi.azurewebsites.net/getSecurityStatusService',
            data: { id: '1', responseType: "JSON" },
            headers: { 'Content-Type': 'application/json' }
        });
    });

    test('should return error response when an error occurs', async () => {
        // Mock error response from doRequest.axios_request
        doRequest.axios_request.mockResolvedValue({
            body: {
                error: true,
                message: "Security status not available"
            }
        });

        const request = { params: { id: '1' } };
        const result = await getSecurity(request, context);

        expect(result.jsonBody).toEqual({
            body: {
                error: true,
                message: "Security status not available"
            }
        });
        expect(doRequest.axios_request).toHaveBeenCalledTimes(1);
    });

    test('should return an empty array when no door information is available', async () => {
        // Mock response with empty doors array
        doRequest.axios_request.mockResolvedValue({
            body: {
                error: false,
                data: {
                    doors: {
                        values: []
                    }
                }
            }
        });

        const request = { params: { id: '2' } };
        const result = await getSecurity(request, context);

        expect(result).toEqual({
            jsonBody: []
        });
        expect(doRequest.axios_request).toHaveBeenCalledTimes(1);
    });
});