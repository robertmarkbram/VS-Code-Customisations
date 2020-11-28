# CS-Code-Customisations

Customisations I use for VS-Code

## Snippets

`snippets` are copied to `%APPDATA%\Code\User\snippets`.

## Command to go to next and previous whitespace

Control left/right arrow is fine for normal english.. but when I'm coding I want to skip the pesky punctuation and code characters.. Go the next/previous SPACE.

1. Install [vscode-powertools](https://github.com/egodigital/vscode-powertools)
2. Define powertools commands in settings: `%APPDATA%\Code\User\settings.json`

    ```json
    "ego.power-tools": {
        "commands": {
            "goToNextWhiteSpaceInDocument": {
                // Cannot use environment variables.. yet. https://github.com/microsoft/vscode/issues/2809
                // "script": "${env:APP_DATA}/goToNextWhiteSpaceInDocument.js",
                "script": "[absolute path to APPDATA with forward slashes]/Code/User/goToNextWhiteSpaceInDocument.js",
            },
            "goToPreviousWhiteSpaceInDocument": {
                // Cannot use environment variables.. yet. https://github.com/microsoft/vscode/issues/2809
                // "script": "${env:APP_DATA}/goToPreviousWhiteSpaceInDocument.js",
                "script": "[absolute path to APPDATA with forward slashes]/Code/User/goToPreviousWhiteSpaceInDocument.js",
            }
        }
    }
    ```

3. Copy command files.
    1. Copy file `commands/goToPreviousWhiteSpaceInDocument.js` to `%APPDATA%\Code\User\goToPreviousWhiteSpaceInDocument.js`.
    3. Copy file `commands/goToNextWhiteSpaceInDocument.js` to `%APPDATA%\Code\User\goToNextWhiteSpaceInDocument.js`.
4. Define keyboard shortcuts in `%APPDATA%\Code\User\keybindings.json`

    ```json
    {
        "key": "shift+alt+]",
        "command": "goToNextWhiteSpaceInDocument"
    },
    {
        "key": "shift+alt+[",
        "command": "goToPreviousWhiteSpaceInDocument"
    }
    ```
