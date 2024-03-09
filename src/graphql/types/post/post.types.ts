import gql from 'graphql-tag';

export default gql`
  scalar Date

  union SearchResultPA = Post | User

  input PostInput {
    title: String!
    content: String!
    categoryId: ID!
  }

  input CommentInput {
    text: String!
    postId: ID!
  }

  input ProfileInput {
    bio: String!
  }

  input LoginInput {
    login: String!
    password: String!
  }

  input SignupInput {
    email: String!
    name: String!
    password: String!
  }

  type Query {
    posts(filterNeedle: String): [Post!]!
    postById(postId: ID!): Post
    authorById(authorId: ID!): User
    postComments(postId: ID!): [Comment!]!
    authorComments(authorId: ID!): [Comment]!
    searchPA(query: String!): [SearchResultPA]!
  }

  type Mutation {
    createPost(postInput: PostInput!): Post!
    addComment(commentInput: CommentInput!): Comment!
    addProfile(profileInput: ProfileInput!): Profile!
    addCategory(name: String!): Category!
    login(loginInput: LoginInput!): AuthPayload!
    signup(signupInput: SignupInput!): AuthPayload!
  }

  enum ContentLimit {
    SMALL
    MEDIUM
    LARGE
  }

  type AuthPayload {
    token: String!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    createdAt: Date!
    updatedAt: Date!
    published: Boolean!
    author: User!
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
