import { APIGatewayProxyEvent } from 'aws-lambda';
export interface Event<Body> extends APIGatewayProxyEvent {
    body: string;
    jsonBody: Body;
}
export declare const parseBody: <Body_1>(event: Event<Body_1>) => Body_1;
