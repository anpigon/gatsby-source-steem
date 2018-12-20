// const { promisify } = require('bluebird');
// const { createClient } = require('lightrpc');
// const client = createClient('https://api.steemit.com');
// const sendAsync = promisify(client.send, { context: client });

const getAll = require('../get-all');
const Remarkable = require('remarkable');
const md = new Remarkable();
const path = './data'
const tag = 'anpigon'
const sortBy = 'blog'
// const limit = 1;

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
  function createPost(post) {
    const title = post.title
    const date = new Date(`${post.created}Z`);
    const json_metadata = JSON.parse(post.json_metadata);
    const tags = json_metadata.tags || [];
    const category = json_metadata.category || (parseCategory(title) || "_"); //title.match(/(?<=^\[)([^}]*)(?=\])/g)
    const summary = makeSummary(post.body);
    const content = [
      '---',
      `title: "${title.replace(/\"/g, '')}"`,
      `author: ${post.author}`,
      `date: "${post.created}Z"`,
      `layout: post`,
      `draft: false`,
      `path: "${post.url}"`,
      `category: "${category}"`,
      `tags:`,
      ...tags.map(tag => `  - "${tag}"`),
      `description: "${summary}"`,
      '---',
      `${post.body}`
    ]
    console.log(content)
    // const fileName = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${(date.getDate()).toString().padStart(2,'0')}---${post.permlink}`;
    // fs.writeFileSync(`${path}/${fileName}.md`, content.join('\n'), 'utf8');
  }

  const posts = await getAll(tag, sortBy);
  posts.forEach(post => {
    createPost(post);
  });
})()  