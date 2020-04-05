import { APIGatewayProxyEvent } from 'aws-lambda';

export interface Event<Body> extends APIGatewayProxyEvent {
  body: string;
  jsonBody: Body;
}

export const parseBody = <Body>(event: Event<Body>): Body => {
  return JSON.parse(event.body) as Body;
};
