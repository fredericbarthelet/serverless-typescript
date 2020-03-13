# Serverless Typescript

[![Serverless][ico-serverless]][link-serverless]

A Serverless plugin improving typescript developer experience.
Lambda related configuration should be as close as possible from actually executed source code.
Target typical lambda structure :

```ts
interface MyHTTPEvent extends APIGatewayProxyEvent {
  pathParameters: {
    myParam: string;
  }
  jsonPayload: {
    param1: string;
    param2: number;
  }
}

/*
 * @Security({'custom:role': Role.Superadmin})
 * @Path('GET', '/api/{myParam}/list')
 */
export const main = async (event: MyHTTPEvent): Promise<APIGatewayProxyResult> => {
  console.log(event.param1);
  //...
};
```

## Highlights

* [AWS] API Gateway HTTP input validation based on typescript interfaces
* [AWS] API Gateway routing from annotation
* [AWS] Cognito custom attributes checking on request

## Install

```bash
$ npm install serverless-typescript --save-dev
```

Add the plugin to your `serverless.yml` file:

```yaml
plugins:
  - serverless-typescript
```

[ico-serverless]: http://public.serverless.com/badges/v3.svg

[link-serverless]: http://www.serverless.com/