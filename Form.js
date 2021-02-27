// output to Form
function addQuestion(form, question) {
  var item = form.addListItem();
  var itemChoices = question.choices.map((choice) =>
    item.createChoice(choice, choice === question.answer)
  );
  item.setChoices(itemChoices);
  item
    .setPoints(1)
    .setTitle(question.title)
    .setHelpText(question.unit)
    .setRequired(true);
}

/**
 * generate form given the questions
 *
 * @param {Array<Question>} questions Questions to be used to generate form.
 * @param {GetQuestionsOptions} options The options for generating questions.
 */
function generateGoogleForm(questions, options) {
  // var form = FormApp.openById('1d3agbttx1DN-aa7IIkdUPJJLc6LL_MdR1E_PqcCSl0g')
  const datetime = Utilities.formatDate(
    new Date(),
    "GMT+8",
    "yyyy-MM-dd HH:mm:ss"
  );
  console.log(`created form @${datetime}`);
  var form = FormApp.create(`LS Concept`);
  form.setDescription(
    `於${datetime}生成。[${options.units.join(", ")}]。共 ${
      questions.length
    } 題。`
  );
  // SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput('<p>Please wait....</p>'), "Now loading... ");

  // init form
  form.getItems().forEach((item) => form.deleteItem(item));
  form.setIsQuiz(true).setShuffleQuestions(true);
  form.setPublishingSummary(true);

  questions.map((question) => addQuestion(form, question));
  console.log(`form url [${form.getPublishedUrl()}]`);
  return form.getPublishedUrl();
}
