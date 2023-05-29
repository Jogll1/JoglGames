var url = window.location.href;
// window.location.href = url + '/hello';
var pagename = location.pathname.split('/');
var page = pagename[2];
var newPage = page.split('.')[0];
let newUrl = url.substring(0, url.length - 14) + newPage;
console.log(newUrl);