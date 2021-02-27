// data with Sheet

// WARN: 0-based for array indexing, +1 when using these for fetching column from sheet
const UNIT_COL = 0;
const TITLE_COL = 1;
const ANSWER_COL = 2;

// WARN: array is modified in-place
// https://javascript.info/task/shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Get unique values of a column as a `Set`.
 * 
 * @param {Number} column The column index, starting from 1.
 * @param {boolean} [skipHeader=true] Whether to treat the first row as header and skip it.
 * @return {Set} The unique values.
 */
function getUniqueColumnValues(column, skipHeader = true) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var offset = (skipHeader) ? 1 : 0;
  var values = sheet.getRange(1 + offset, column, sheet.getLastRow() - offset).getValues();

  return new Set(values.flat(1));
}

/**
 * Get unique values of a column as a `Set`, with filtering.
 * 
 * @param {Number} column The column index, starting from 1.
 * @property {Number} filterColumn The column index, starting from 1, to filter on.
 * @property {Array<String>|Set<String>} filterValues Values to match to.
 * @param {boolean} [skipHeader=true] Whether to treat the first row as header and skip it.
 * @return {Set} The unique values.
 */
function getUniqueColumnValuesByFilter(column, filterColumn, filterValues, skipHeader = true) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var offset = (skipHeader) ? 1 : 0;
  var values = sheet.getRange(1 + offset, 1, sheet.getLastRow() - offset, sheet.getLastColumn()).getValues();
  // assure `filterValues` is a Set
  filterValues = new Set(filterValues);

  return new Set(
    values
      .filter(row => filterValues.has(row[filterColumn-1]))  // filter by filterValues
      .map(row => row[column-1])  // pick column
  );
}

function getUnits() {
  return getUniqueColumnValues(UNIT_COL+1);
}

// function returning Set cannot be called in HTML Service
function getUnitsAsArray() {
  return [...getUnits()];
}

function getAnswers() {
  return getUniqueColumnValues(ANSWER_COL+1);
}

function getAnswersByUnits(units) {
  return getUniqueColumnValuesByFilter(ANSWER_COL+1, UNIT_COL+1, units);
}

/*
 * Options for generating questions.
 * @typedef {Object} GetQuestionsOptions
 * @param {Array[String]|Set[String]} units The set of selected units from which to generate questions.
 * @param {Number} numQuestions Number of questions to select.
 * @param {boolean} choicesIncluded Whether the sheet includes choices.
 * @param {Number} numChoices Number of columns after "Answer" to be used as choices if `choicesIncluded == true`. Number of choices to be generated from other answers if `choicesIncluded == false`.
 */
/*
 * Question structure for generating form.
 * @typedef {Object} Question
 * @param {String} unit The units for this question.
 * @param {String} title The title for this question, used as the actual qusestion.
 * @param {String} answer The answer for this question.
 * @param {Array[String]} choices The choices for this question, answer should be one of them. */
/**
 * Generate questions from according to option.
 *
 * @param {GetQuestionsOptions} options The options for generating questions.
 */
function getQuestions(options) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  console.log(`Reading from sheetid[${sheet.getSheetId()}] name[${sheet.getSheetName()}]`);
  // skip header row
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  // assure `units` is a Set
  var units = new Set(options.units);

  var questions = values;
  if (units.size)
    questions = questions.filter(row => units.has(row[UNIT_COL]));  // filter by units
  console.log(`[${values.length}] questions before units filter, [${questions.length}] questions after`);

  // prepare convert function, genChoices() uses closure for performance's sake
  var convertRowToQuestion;
  if (options.choicesIncluded) {
    // choices are in sheet
    convertRowToQuestion = (row) => {
      return {
        unit: row[UNIT_COL],
        title: row[TITLE_COL],
        answer: row[ANSWER_COL],
        // get next `numChoices` columns as choices
        choices: row.slice(ANSWER_COL + 1, ANSWER_COL + 1 + options.numChoices)  // end - start items will be sliced
      }
    }
  }
  else {
    // generate choices from all answers
    // need to be from the same unit?
    var answers = [...getAnswers()]; /** @type: {Array<String>} */

    // generate `numChoices` from `answers`
    // `answer` must be included
    var genChoices = (answers, numChoices, answer) => {
      const shuffled = shuffle(answers); /** @type: {Array<String>} */

      // randomly pick `numChoices-1` items from `answers`
      const choices = shuffled.slice(0, numChoices - 1); /** @type: {Array<String>} */
      // see if `answer` is in it
      const idx = choices.indexOf(answer);
      if (idx == -1) {
        // not found, add answer to choices
        choices.splice(Math.random() * numChoices, 0, answer);
      }
      else {
        // answer already in choices, add next item 
        choices.push(shuffled[numChoices]);
      }
      return choices;
    }

    convertRowToQuestion = (row) => {
      return {
        unit: row[UNIT_COL],
        title: row[TITLE_COL],
        answer: row[ANSWER_COL],
        choices: genChoices(answers, options.numChoices, row[ANSWER_COL])
      }
    }
  }

  // randomize and pick numQuestions
  questions = shuffle(questions).slice(0, options.numQuestions);
  console.log(`picked [${questions.length}] questions`);
  return questions.map(convertRowToQuestion);
}
