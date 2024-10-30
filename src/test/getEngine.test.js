const doRequest = require('../handler/httpRequestHandler');
const getEngine = require('../functions/getEngine');

jest.mock('../handler/httpRequestHandler'); // Mock the doRequest module

describe('Azure Function: engine', () => {
  let context;

  beforeEach(() => {
    // Mocking the context and request objects
    context = { log: jest.fn() };
  });

  test('should send correct request and return success status for EXECUTED action', async () => {
    const request = {
      params: { id: '1234' },
      json: async () => ({ action: 'START' })
    };

    doRequest.axios_request.mockResolvedValueOnce({
      body: { actionResult: { status: 'EXECUTED' } },
      error: false
    });

    const response = await getEngine.engineHandler(request, context);

    expect(doRequest.axios_request).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: 'http://gmapi.azurewebsites.net/actionEngineService',
      data: { id: '1234', command: 'START', responseType: 'JSON' },
      headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
    }));
    expect(response.jsonBody).toEqual({ status: 'success' });
  });

  test('should return error status for non-EXECUTED action', async () => {
    const request = {
      params: { id: '1234' },
      json: async () => ({ action: 'STOP' })
    };

    doRequest.axios_request.mockResolvedValueOnce({
      body: { actionResult: { status: 'FAILED' } },
      error: false
    });

    const response = await getEngine.engineHandler(request, context)

    expect(response.jsonBody).toEqual({ status: 'error' });
  });

  test('should return original error response if axios_request fails', async () => {
    const request = {
      params: { id: '1234' },
      json: async () => ({ action: 'START' })
    };

    const errorResponse = { body: { error: 'Service unavailable' } };
    doRequest.axios_request.mockResolvedValueOnce(errorResponse);

    const response = await getEngine.engineHandler(request, context)

    expect(response.jsonBody).toEqual(errorResponse);
  });

  test('should return 400 if action is missing in the request body', async () => {
    const request = {
      params: { id: '1234' },
      json: async () => ({})
    };

    const response = await getEngine.engineHandler(request, context)

    expect(response.jsonBody).toEqual({
      statusCode: 400,
      error: {
        type: 'Error response',
        data: 'Action is required in the request body'
      }
    });
  });
});