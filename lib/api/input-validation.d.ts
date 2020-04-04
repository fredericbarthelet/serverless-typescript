import { APIGatewayProxyEvent } from 'aws-lambda';
interface JsonBodyProxyEvent<T> extends APIGatewayProxyEvent {
    body: string;
    jsonBody: T;
}
export declare const parseBody: <T>(event: JsonBodyProxyEvent<T>) => T;
export {};
