import { GraphQLError, GraphQLScalarType, Kind } from "graphql";

export default new GraphQLScalarType({
  name: 'Date',
  description: 'Custom `Date` scalar type',
  serialize(value) {
    // value sent to the client
    if(value instanceof Date) {
      return value.getTime();
    }

    throw new GraphQLError('GraphQL `Date` scalar serializer expected a `Date` object');
  },
  parseValue(value) {
    // value from the client
    if(typeof value === 'number') {
      return new Date(value);
    }

    throw new GraphQLError('GraphQL `Date` scalar parser expected a `number`');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }

    return null;
  }
});
