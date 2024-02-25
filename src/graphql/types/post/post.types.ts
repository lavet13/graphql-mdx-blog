import gql from 'graphql-tag';

export default gql`
  scalar Date

  union SearchResultPA = Post | User

  input PostInput {
    title: String!
    content: String!
    author: UserInput!
  }

  input UserInput {
    name: String!
    email: String!
  }

  input CommentInput {
    text: String!
    author: UserInput
  }

  type Query {
    posts: [Post!]!
    postById(postId: ID!): Post
    authorById(authorId: ID!): User
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
    createdAt: Date!
    updatedAt: Date!
    published: Boolean!
    author: User
    preview(size: ContentLimit = MEDIUM): String!
    comments: [Comment!]!
    categories: [Category!]!
  }

  type Category {
    id: ID!
    name: String!
    posts: [Post!]!
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: Role!
    posts: [Post!]!
    profile: Profile
    comments: [Comment!]!
  }

  type Profile {
    id: ID!
    bio: String!
    user: User!
  }

  enum Role {
    USER
    ADMIN
  }

  type Comment {
    id: ID!
    text: String!
    createdAt: Date!
    updatedAt: Date!
    author: User!
    post: Post!
  }
`;
