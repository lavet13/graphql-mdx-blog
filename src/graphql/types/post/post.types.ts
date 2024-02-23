import gql from 'graphql-tag';

export default gql`
  union SearchResultPA = Post | Author

  input PostInput {
    title: String!
    content: String!
    author: AuthorInput!
  }

  input AuthorInput {
    name: String!
    email: String!
  }

  input CommentInput {
    text: String!
    author: AuthorInput
  }

  type Query {
    posts: [Post!]!
    postById(postId: ID!): Post
    authorById(authorId: ID!): Author
    postComments(postId: ID!): [Comment!]!
    authorComments(authorId: ID!): [Comment]!
    searchPA(query: String!): [SearchResultPA]!
  }

  enum ContentLimit {
    SMALL
    MEDIUM
    LARGE
  }

  type Mutation {
    createPost(postInput: PostInput!): Post
    addComment(postId: ID!, commentInput: CommentInput!): Comment
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    preview(size: ContentLimit = MEDIUM): String!
    author: Author!
    comments: [Comment!]!
  }

  type Author {
    id: ID!
    name: String!
    email: String!
  }

  type Comment {
    id: ID!
    text: String!
    author: Author!
  }
`;
