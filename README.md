# This boilerplate is still under development

# serverless-auth-boilerplate
Serverless backend in AWS Lambda with basic Auth features. Using serverless-async-await to support async await syntax, and serverless-plugin-warmup to prevent cold start issue.

I am using my own fork of serverless-async-await as it has conflict with serverless-plugin-warmup.

This module uses DynamoDB but you can easily tweak into any DB of your choice. I choose DynamoDB due to its auto-scalability (like Lambda) so that it will be fully serverless and scalable

## Set up
1. Create `sec/jwt.key` and `sec/jwt.key.pub` for JSON Web Token
2. Change configs on `serverless.yml`
3. Set up environmental variables for AWS keys
4. If you are using DynamoDB, create a table with `id` as primary key, `username`, `refreshToken` as GSI with name `username-index`, `refreshToken-index`
5. If you do not want to use DynamoDB, just edit the `model` folder to CRUD from the DB of your choice
