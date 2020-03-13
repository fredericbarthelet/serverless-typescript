import Serverless, { Options } from 'serverless';
declare class ServerlessTypescript {
    private serverless;
    private options;
    constructor(serverless: Serverless, options: Options);
    hooks: {
        'before:package:createDeploymentArtifacts': () => void;
    };
}
export = ServerlessTypescript;
