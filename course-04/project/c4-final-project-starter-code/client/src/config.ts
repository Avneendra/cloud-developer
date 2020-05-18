// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'vkbg12hgjd'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'kanva-udagram.auth0.com',            // Auth0 domain
  clientId: 'H3YAIH6yp6hYsOMCnpS4IqNhvNfQWYp9',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
