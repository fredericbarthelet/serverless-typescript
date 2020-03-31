import { FunctionDefinition } from 'serverless';
interface FunctionDefinitionInfos {
    filePath: string;
    functionName: string;
}
export declare const getFunctionDefinitionInfos: (serverlessFunction: FunctionDefinition) => FunctionDefinitionInfos;
export {};
