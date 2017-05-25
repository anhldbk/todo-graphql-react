class Post {
  constructor(title, content) {
    this.id = Post._count++;
    this.title = title;
    this.content = content;
  }
}

Post._count = 0;

class Database {
  constructor() {
    this.posts = [];
  }
  get() {
    return this.posts;
  }
  add(title, content) {
    var post = new Post(title, content);
    this.posts.push(post);
    return post;
  }
}

var db = new Database();
export default db;
