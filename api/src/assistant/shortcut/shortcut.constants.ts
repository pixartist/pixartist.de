export class ShortcutConstants {
  static readonly FUNCTION_NAME = 'run_shortcut';

  static readonly INSTRUCTIONS = `You control my shortcuts.
I will provide you with a list of available shortcuts and a task. You can run any number of shortcuts in series. Each shortcuts output will be provided to you.
Use the shortcut names exactly as provided. Put the named parameters and their values into the params object.`;
  static readonly MODEL = 'gpt-4';
  static readonly NAME = 'Shortcut Assistant';
  static readonly FUNCTION = {
    'name': ShortcutConstants.FUNCTION_NAME,
    'description': 'Runs the shortcut with the name given in the run field with the given named parameters',
    'parameters': {
      'type': 'object',
      'properties': {
        'run': {
          'type': 'string'
        },
        'params': {
          'type': 'object',
          'patternProperties': {
            '^.*$': {
              'type': 'string'
            }
          }
        }
      },
      'required': [
        'run',
        'params'
      ]
    }
  };
  static readonly POLL_INTERVAL = 1000;
  static readonly MAX_POLL_COUNT = 10;
}