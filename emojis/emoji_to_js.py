# Usage:
# python emoji_to_js.py > emoji.js

# emoji.js sourced from:
# https://github.com/iamcal/emoji-data

import json


with open('emoji.json') as emoji_json:
    data = json.load(emoji_json)


emoji_codes = {}

for emoji_data in data:
    for short_name in emoji_data['short_names']:
        emoji_codes[short_name] = emoji_data['unified']


print('BUILTIN_EMOJIS = {')
for name, code in sorted(emoji_codes.items(), key=lambda item: item[0]):
    html_code = ''.join('&#x{}'.format(part) for part in code.split('-'))
    print('  \'{}\': \'{}\','.format(name, html_code))

print('};')
