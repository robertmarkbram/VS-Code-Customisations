
/*
    Go to previous white space
    ==========================

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
    // Current offset within editor (from start of current selection, 
    // which will be where the cursor is).
    const currentOffset = currentDocument.offsetAt(currentPosition);

    /*
        Return true if current position is at start of the current line.
    */
    function atStartOfCurrentLine() {
        return currentPosition.character === 0;
    }

    /*
        Return true if current position is at start of file.
    */
    function atStartOfFile() {
        return atStartOfCurrentLine() && onFirstLine();
    }

    /*
        Change position to start of current line.
    */
    function goToStartOfCurrentLine() {
        // Go to start of line.
        const nextPosition = currentDocument.lineAt(currentPosition.line).range.start;
        activeEditor.selection = new vscode.Selection(nextPosition /* start */, nextPosition /* end */);
    }

    /*
        Change position to end of previous line.
    */
    function goToEndOfPreviousLine() {
        // Go to end of previous line.
        const nextPosition = currentDocument.lineAt(currentPosition.line - 1).range.end;
        activeEditor.selection = new vscode.Selection(nextPosition /* start */, nextPosition /* end */);
    }

    /*
        Jump previous word: jump to start of previous set of white space before current set of non-white space.
    */
    function jumpPreviousWord() {
        // From current position to start of line.
        const textToStartOfLine = currentDocument.getText(
            new vscode.Range(
                currentPosition.line   /* start line */, 0                          /* start column */,
                currentPosition.line   /* end line   */, currentPosition.character  /* end column   */,
            )
        );

        // Result of looking for first white space in rest of line.
        const regexResult = /\s+/.exec(reverseString(textToStartOfLine));

        // No result - near start of line (but not at start - we already tested for that).
        if (!regexResult) {
            // Go to start of line.
            goToStartOfCurrentLine();
            // Do nothing more.
            return;
        } else {
            // Go backward to previous space. Work out previous position we want to be at.
            const nextPosition = activeEditor.document.positionAt(currentOffset - (regexResult.index + regexResult[0].length));
            activeEditor.selection = new vscode.Selection(nextPosition /* start */, nextPosition /* end */);
            return;
        }
    }

    /*
        Return true if current position is on the first line of the file.
    */
    function onFirstLine() {
        return currentPosition.line === 0;
    }

    /*
        Reverse string so that we can look for next space on it, rather than using regex to look for previous space.
    */
    function reverseString(str) {
        // Step 1. Use the split() method to return a new array
        var splitString = str.split(""); // var splitString = "hello".split("");
        // ["h", "e", "l", "l", "o"]

        // Step 2. Use the reverse() method to reverse the new created array
        var reverseArray = splitString.reverse(); // var reverseArray = ["h", "e", "l", "l", "o"].reverse();
        // ["o", "l", "l", "e", "h"]

        // Step 3. Use the join() method to join all elements of the array into a string
        var joinArray = reverseArray.join(""); // var joinArray = ["o", "l", "l", "e", "h"].join("");
        // "olleh"
        
        //Step 4. Return the reversed string
        return joinArray; // "olleh"
    }

    if(atStartOfFile()) {
        // Do nothing.
        vscode.window.showInformationMessage('At start of file.');
        return;
    } else if (atStartOfCurrentLine()) {
        goToEndOfPreviousLine();
    } else {
        jumpPreviousWord();
    }

};

