const Plugin = require ('.');
const serverlessTypescript = new Plugin();

describe('getHandlerFile', () => {
  it('should return file path', () => {
    const serverlessFunction = {
      handler: 'functions/directory/file.functionName',
    };
    expect(serverlessTypescript.getHandlerFile(serverlessFunction)).toStrictEqual('functions/directory/file');
  });
});
