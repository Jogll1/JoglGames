//code that modifies the url by removing the file path and replacing it with just the name of the html file
var fileName = window.location.pathname.split('/').pop(); //get filename fom url
fileName = fileName.split('.').slice(0, -1).join('.'); //remove the extension from the filename
window.history.replaceState({}, '', '/' + fileName); //modify the url to only include the filename without extension