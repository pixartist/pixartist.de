export class ShortcutConstants {
  static readonly FUNCTION_NAME = 'run_shortcut';

  static readonly INSTRUCTIONS = `You can run some of my iOS shortcuts.
Provided is a list with available shortcut names, brackets indicated possible named parameters.
You can use the function "run_shortcut" to directly solve the task, or use it to run other shortcuts first if you are missing information.
ALWAYS use the function "run_shortcut" to reply, unless the conversation is over.s
If you run a shortcut, I will provide you with the ouput of the shortcut.
Use the shortcut names exactly as provided including the parameter names.
Don't remove parameters from shortcut names. 
Slashes in parameter names denote possible values for that parameter.
Put the named parameters and their values into the params object.
If you have to ask me any question or need additional information, use the prompt shortcut.
I might ask in German but the shortcuts are all in english, translate if necessary.`;
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