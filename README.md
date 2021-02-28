# GenGoogleForm

Google Apps Script project to read data form a Google Sheet and generate a Google Form.

The data in Sheet shall have this convention (see `Question` struct in code):

- First Row: title, ignored
- First Column: `units`  
  They will be used for filtering a subset of questions used to generate the form.
- Second Column: `titles`  
  The title for this question, used as the actual question.
- Third Column: `answer`  
  The answer for this question.
- Remaining Columns: `choices`
  If `choicesIncluded` is selected (using choices from Sheet), there should be `numChoices` columns to the right of `answer` for the choices of this question. And `answer` should be included in one of the them.

## Usage

1. The User first select the Sheet containing the questions
2. [Optionally] set Form title
3. Select units
   script will filter the questions using this list and pick `numQuestions` for the Form
4. Set number of questions in the Form
5. Whether to use choices from Sheet  
   script will read `numChoices` columns to the right of `answer` if checked
   otherwise it will generated `numChoices` choices from all the `answer`'s

Current this is implemented as a bound script to the Google Sheet owning the question data.

Use case 1 (single SpreadSheet, each Sheet corresponds to a From)

- Create App Script from the SpreadSheet and `clash push` to it
- Default `formTitle` should be the Sheet name (_TODO_)

User case 2 (one Form per SpreadSheet)

- Create App Script from each SpreadSheet and `clash push` to it
- Default `formTitle` should be the SpreadSheet name (current behavior)

## Reference

[Command Line Interface using clasp  |  Apps Script  |  Google Developers](https://developers.google.com/apps-script/guides/clasp)
