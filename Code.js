// UI
// TODO: 
// genereate multi-select choices with `getUnits()`
// pass selected `units` to gs
// filter questions from selected `units` and then randomly pick 20
// generate form with text input from the 20 questions

function onOpen() {
  var menu = SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
    .createMenu('Create Form');

  menu.addItem('Show sidebar', 'showSideBar')
    .addToUi();
}

function showSideBar() {
  var template = HtmlService.createHtmlOutputFromFile('sidebar2').setTitle('Create Google Form');
  SpreadsheetApp.getUi().showSidebar(template);
}

function processForm(options) {
  const ui = SpreadsheetApp.getUi();
  if (options && options.units.length == 0) {
    ui.alert('Aborted', 'No units selected', ui.ButtonSet.OK);
    return;
  }
  const response = ui.alert('Almost ready', 'This might take a while, please wait patiently....\nPress Ok to continue.', ui.ButtonSet.OK_CANCEL);
  if (response === ui.Button.CANCEL) return;

  // HACK: override for testing
  if (options == null) {
    options = {
      units: ['個人成長', '全球化'],
      numQuestions: 15,
      choicesIncluded: false,
      numChoices: 6,
    }
  }

  console.log('options', options);
  const questions = getQuestions(options);
  const link = generateGoogleForm(questions, options);
  openUrl(link);
}

function openUrl(url) {
  var html = `<body><p>Click <a href="${url}" target="_blank">here</a> to open the form</p></body>`;
  var output = HtmlService.createHtmlOutput(html)
  output.setWidth(250).setHeight(300);
  var ui = SpreadsheetApp.getUi().showModelessDialog(output, "Create Google Form");
}