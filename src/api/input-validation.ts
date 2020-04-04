import { APIGatewayProxyEvent } from 'aws-lambda';

interface JsonBodyProxyEvent<T> extends APIGatewayProxyEvent {
  body: string;
  jsonBody: T;
}

export const parseBody = <T>(event: JsonBodyProxyEvent<T>) => {
  return JSON.parse(event.body) as T;
};
