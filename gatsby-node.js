const fs = require('fs');
// const crypto = require('crypto');
const getAll = require('./get-all');

exports.sourceNodes = async ({ boundActionCreators }, { path, tag, sortBy }) => {
  const { createNode } = boundActionCreators;

  function createPost(post) {
    const title = post.title
    const date = new Date(`${post.created}Z`);
    const json_metadata = JSON.parse(post.json_metadata);
    const tags = json_metadata.tags || [];
    const category = json_metadata.category || (title.match(/(?<=^\[)([a-zA-Zㄱ-힣\s]*)(?=\])/g) || ""); //title.match(/(?<=^\[)([^}]*)(?=\])/g)
    const content = [
      '---',
      `title: "${title}"`,
      // `author: ${post.author}`,
      `date: "${post.created}Z"`,
      `layout: post`,
      `draft: false`,
      `path: "${post.url}"`,
      `category: "${category}"`,
      `tags:`,
      ...tags.map(tag => `  - "${tag}"`),
      `description: "${post.body.replace(/\n/g, ' ').substr(0, 200)}"`,
      '---',
      `${post.body}`
    ]
    const fileName = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${(date.getDate()).toString().padStart(2,'0')}---${post.permlink}`;
    fs.writeFileSync(`${path}/${fileName}.md`, content.join('\n'), 'utf8');
  }

  const posts = await getAll(tag, sortBy);
  posts.forEach(post => {
    createPost(post);
    // const nodeStr = JSON.stringify(post);
    // const nodeHash = crypto
    //   .createHash('md5')
    //   .update(nodeStr)
    //   .digest('hex');

    // createNode({
    //   ...post,
    //   id: `${post.id}`,
    //   parent: null,
    //   children: [],
    //   internal: {
    //     type: 'SteemPost',
    //     content: nodeStr,
    //     contentDigest: nodeHash,
    //   },
    // });
  });

  return;
};
