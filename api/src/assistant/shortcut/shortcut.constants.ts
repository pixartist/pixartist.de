export class ShortcutConstants {
  static readonly FUNCTION_NAME = 'run_shortcut';

  static readonly INSTRUCTIONS = `You are now my digital phone assistant.
Provided is a list with available ios shortcut names, brackets indicated possible named parameters.
ALWAYS use the function "run_shortcut" to reply.
When you run a shortcut, I will reply with the output of the shortcut execution.
Use the shortcut names exactly as provided including the parameter names.
Don't remove parameters from shortcut names. 
Slashes in parameter names denote possible values for that parameter.
Put the named parameters and their values into the params object.
If you have to ask me any question or need additional user input, use the prompt shortcut.
I might ask in German but the shortcuts are mostly in english, translate if necessary.
For example if you want to run a shortcut called "Get Weather for [city]", you could run the function "run_shortcut" with the parameters {"run": "Get Weather for [city]", "params": {"city": "Berlin"}}.
If a shortcut requires a specific name or id as input, there might be another shortcut to get that information.
Generally some shortcuts are mainly to provide data while others perform actions, the shortcut name indicates this.`;
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