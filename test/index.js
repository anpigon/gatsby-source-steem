const { promisify } = require('bluebird');
const { createClient } = require('lightrpc');
const client = createClient('https://api.steemit.com');
const sendAsync = promisify(client.send, { context: client });

const Remarkable = require('remarkable');
const md = new Remarkable();

function makeSummary(text) {
  let summary = md.render(text);
  summary = summary.replace(/<(?:.|\n)*?>/gm, '');
  summary = summary.replace(/(http(s)?:\/\/steemitimages.com\/([0-9]+x[0-9]+)\/)?http(s)?:\/\/(\w*:\w*@)?[-\w.]+(:\d+)?(\/([\w/_.]*(\?\S+)?)?)?/g, '');
  summary = summary.replace(/(\s)+Sponsored \( Powered by dclick \)(.|\n)*/im, '');
  summary = summary.replace(/\n/g,' ').trim();
  return summary.slice(0, 200).trim() + (summary.length > 200 ? "..." : "");
}

const cateRegExp = new RegExp(/(?<=^\[)([^/]*)(?=\])/g);
function parseCategory(text) {
  // let category = (text.match(/(?<=^\[)([a-zA-Zㄱ-힣\s]*)(?=\])/g)
  // let category = (text.match(/(?<=^\[)([^/]*)(?=\])/g)
  if(cateRegExp.test(text)) {
    let [ category ] = text.match(cateRegExp)
    return category.replace(/#\d{0,3}/g, '').trim();
  }    
  return null;
}

(async () => {  
  const result = await sendAsync(`get_discussions_by_blog`, [{ tag: 'anpigon', limit: 10 }])
  .then(r => r.filter(e => e.author === 'anpigon'));
  // console.log(result);

  for(key in result) {
    // const sumarry = makeSummary(result[key].body)
    // console.log(sumarry, '\n----------');
    const category = parseCategory(result[key].title);
    console.log(category, result[key].title)
  }
})()  