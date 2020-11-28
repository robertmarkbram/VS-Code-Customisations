
/*
    Go to next white space
    ======================

    From the current position, find the next (or current) group of white space and jump to the end of that.

    - If already at the end of the file, do nothing.
    - If already at the end of the line, jump to the start of the next line.
    - If not at the end of the line but there is no white space between the current position and the end of the line, jump to the end of the line.

    From the current position, find the previous (or current) group of white space and jump to the start of that.

    - If already at the start of the file, do nothing.
    - If already at the start of the line, jump to the end of the previous line.
    - If not at the start of the line but there is no white space between the current position and the start of the line, jump to the start of the line.

    Was using regex to look for previous whitespace, but for some reason that was giving unpredictable results *after* running goToNextWhiteSpace.. 
        // Regex to find last sequence of white space ending at current position.
        // const whiteSpaceRegex = /\S*(\s+\S+)$/;
    So crude work-around: reverse the string and look for next white space.. and subtract result from current position.

    VS-CODE objects
    ===============

    Text editor: https://code.visualstudio.com/api/references/vscode-api#TextEditor
        - Current text editor: vscode.window.activeTextEditor

    Text document: https://code.visualstudio.com/api/references/vscode-api#TextDocument
        - Text editor has a text document
            vscode.window.activeTextEditor.document
        - Offset is index within document: count of characters from start of text.
        - You can get offset from a position (offsetAt); you can get position from an offset (positionAt).

    Position: https://code.visualstudio.com/api/references/vscode-api#Position
        - Line number, column number.

    Range: https://code.visualstudio.com/api/references/vscode-api#Range
        - Editor has a selection.
            vscode.window.activeTextEditor.selection
        - Selection is a range (from start position to end position).
            vscode.window.activeTextEditor.selection.start
            vscode.window.activeTextEditor.selection.end

    Output a debug line.
        vscode.window.showInformationMessage('message');

    Javascript objects
    ==================

    Javascript regexp.exec: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
        - gives back a result, or null if no match.
        - result has index to the first match

*/
exports.execute = async (args) => {
    // args => https://egodigital.github.io/vscode-powertools/api/interfaces/_contracts_.workspacecommandscriptarguments.html

    // https://code.visualstudio.com/api/references/vscode-api
    const vscode = args.require('vscode');

    // Current editor.
    const activeEditor = vscode.window.activeTextEditor;
    // Position of cursor - starting point of current selection.
    const currentPosition = activeEditor.selection.start;
    // Current document.
    const currentDocument = activeEditor.document;
    // Current line.
    const currentLineLength = currentDocument.lineAt(currentPosition.line).text.length;
    // Current offset within editor (from start of current selection, 
    // which will be where the cursor is).
    const currentOffset = currentDocument.offsetAt(currentPosition);

    /*
        Return true if current position is at end of the current line.
    */
    function atEndOfCurrentLine() {
        return currentPosition.character === currentLineLength;
    }

    /*
        Return true if current position is at end of file.
    */
    function atEndOfFile() {
        return atEndOfCurrentLine() && onLastLine();
    }

    /*
        Change position to end of current line.
    */
    function goToEndOfCurrentLine() {
        // Go to end of line.
        const nextPosition = currentDocument.lineAt(currentPosition.line).range.end;
        activeEditor.selection = new vscode.Selection(nextPosition /* start */, nextPosition /* end */);
    }

    /*
        Change position to start of next line.
    */
    function goToStartOfNextLine() {
        // Go to start of next line.
        const nextPosition = currentDocument.lineAt(currentPosition.line + 1).range.start;
        activeEditor.selection = new vscode.Selection(nextPosition /* start */, nextPosition /* end */);
    }

    /*
        Jump next word: jump to end of next set of white space after current set of non-white space.
    */
    function jumpNextWord() {
        // From current position to end of line.
        const textToEndOfLine = currentDocument.getText(
            new vscode.Range(
                currentPosition.line   /* start line */, currentPosition.character  /* start column */,
                currentPosition.line   /* end line   */, currentLineLength          /* end column   */,
            )
        );

        // Result of looking for first white space in rest of line.
        const regexResult = /\s+/.exec(textToEndOfLine);

        // No result - near end of line (but not at end - we already tested for that).
        if (!regexResult) {
            // Go to end of line.
            goToEndOfCurrentLine();
            // Do nothing more.
            return;
        } else {
            // Go forward to next space. Work out next position we want to be at.
            const nextPosition = activeEditor.document.positionAt(currentOffset + regexResult.index + regexResult[0].length);
            activeEditor.selection = new vscode.Selection(nextPosition /* start */, nextPosition /* end */);
            return;
        }
    }

    /*
        Return true if current position is on the last line of the file.
    */
    function onLastLine() {
        return currentPosition.line === currentDocument.lineCount - 1;
    }

    if(atEndOfFile()) {
        // Do nothing.
        vscode.window.showInformationMessage('At EOF.');
        return;
    } else if (atEndOfCurrentLine()) {
        goToStartOfNextLine();
    } else {
        jumpNextWord();
    }

};

