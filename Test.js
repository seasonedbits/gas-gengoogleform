function testSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  console.log(
    `Reading from sheetid[${sheet.getSheetId()}] name[${sheet.getSheetName()}]`
  );

  console.log("units:");
  for (let item of getUnits()) console.log(item);

  // console.log('answers:');
  // let answers = getAnswers();
  // for (let item of getAnswers())
  //   console.log(item);

  console.log("answersByUnits");
  for (let item of getAnswersByUnits(["個人成長", "全球化"])) console.log(item);
}

function testGetQuestions() {
  const options = {
    units: ["個人成長", "全球化"],
    numQuestions: 15,
    choicesIncluded: false,
    numChoices: 4,
  };
  const questions = getQuestions(options);
  questions.forEach((a) => console.log(a));
  return questions;
}

function testForm() {
  generateGoogleForm(testGetQuestions());
}
