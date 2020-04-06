import { getHandlerEventArgumentType } from './ast-explorer';

const file = `
interface Event<Body> {
  body: string;
  jsonBody: Body;
}

interface InterfaceEvent1 {
  content: string;
}
interface InterfaceEvent2 {
  content: string;
}
interface RandomInterface {
  content: string;
}

export const arrowFunctionHandler = (event: Event<InterfaceEvent1>) => {
  console.log(event);
}

export const arrowFunctionHandlerWithBadTyping = (event: RandomInterface) => {
  console.log(event);
}

export function functionHandler(event: Event<InterfaceEvent2>) {
  console.log(event);
}

export const wrappedArrowFunctionHandler = wrapper('wrapperArgument')(
  (event: Event<InterfaceEvent1>) => {
    console.log(event);
  }
)

export const multiWrappedArrowFunctionHandler = wrapper1('wrapperArgument')(
  wrapper2('wrapperArgument')(
    wrapper3('wrapperArgument')(
      (event: Event<InterfaceEvent1>) => {
        console.log(event);
      }
    )
  )
)

export function notTypedFunctionHandler(event) {
  console.log(event);
}

export const notTypedArrowFunctionHandler = (event) => {
  console.log(event);
}

export const noArgumentArrowFunctionHandler = () => {
  console.log('my event');
}

export function noArgumentFunctionHandler() {
  console.log('my event');
}
`;

describe('AST explorer', () => {
  test('getHandlerEventArgumentType', () => {
    expect(
      getHandlerEventArgumentType('file', file, 'arrowFunctionHandler'),
    ).toBe('InterfaceEvent1');
    expect(
      getHandlerEventArgumentType(
        'file',
        file,
        'arrowFunctionHandlerWithBadTyping',
      ),
    ).toBe(undefined);
    expect(getHandlerEventArgumentType('file', file, 'functionHandler')).toBe(
      'InterfaceEvent2',
    );
    expect(
      getHandlerEventArgumentType('file', file, 'wrappedArrowFunctionHandler'),
    ).toBe('InterfaceEvent1');
    expect(
      getHandlerEventArgumentType(
        'file',
        file,
        'multiWrappedArrowFunctionHandler',
      ),
    ).toBe('InterfaceEvent1');
    expect(
      getHandlerEventArgumentType('file', file, 'notTypedFunctionHandler'),
    ).toBe(undefined);
    expect(
      getHandlerEventArgumentType('file', file, 'notTypedArrowFunctionHandler'),
    ).toBe(undefined);
    expect(
      getHandlerEventArgumentType(
        'file',
        file,
        'noArgumentArrowFunctionHandler',
      ),
    ).toBe(undefined);
  });
});
