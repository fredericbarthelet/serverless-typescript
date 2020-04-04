# API Gateway HTTP input validation based on typescript interfaces

## Improvement definition

| Key                         | Value       |
|---                          |---          |
| Supported provider          | AWS         |
| Affected service definition | API Gateway |

## Context

Serverless framework allows [HTTP input validation](https://serverless.com/framework/docs/providers/aws/events/apigateway#request-schema-validators) using `request/schema` key with JSON Schema descriptors.

The recommended way to define this validation is to create a JSON file `create_request.json` and reference this file in function Serverless definition like so :

```yaml
functions:
  create:
    handler: posts.create
    events:
      - http:
          path: posts/create
          method: post
          request:
            schema:
              application/json: ${file(create_request.json)}
```

API Gateway will then proceed with body validation based on `create_request.json` description and return `400 Bad Request` HTTP response on validation errors, without triggering the corresponding lambda.

You can then be confident writting the following :

```ts
export const main = (event) => {
      const input: CreateBody = JSON.parse(event.body);
```

## Problem

* Typescript static typing of parsed input `CreateBody` defines expected body parsed format.
* JSON Schema definition `create_request.json` defines requested input validation to be performed by AWS API Gateway

> There are no guarantee `CreateBody` and `create_request.json` defines the same validation constraints at all times.

## Solution

```ts
import { APIGatewayProxyEvent } from 'aws-lambda';
import { parseBody } from 'serverless-typescript/lib/api/input-validation';

interface CreateFunctionInterface extends APIGatewayProxyEvent {
  jsonBody: {
    firstname: string;
    lastname: string;
  } 
}

export const main = (event: CreateFunctionInterface) => {
  /*
   * Using parseBody method from serverless-typescript, result will be typed
   * using jsonBody type from interface used to type the handler's event arg
   */
  const input = parseBody(event);
  return {
    body: `Hello ${input.firstname} ${input.lastname}`
  }
}
```

This plugin will use interface typing handler's event argument to generate a JSON Schema descriptor and reference it within serverless configuration.
