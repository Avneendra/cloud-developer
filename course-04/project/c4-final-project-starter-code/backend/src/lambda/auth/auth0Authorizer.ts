
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')
import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDCTCCAfGgAwIBAgIJYcu8R0D9JMmAMA0GCSqGSIb3DQEBCwUAMCIxIDAeBgNV
BAMTF2thbnZhLXVkYWdyYW0uYXV0aDAuY29tMB4XDTIwMDUxNzIxMTA1MloXDTM0
MDEyNDIxMTA1MlowIjEgMB4GA1UEAxMXa2FudmEtdWRhZ3JhbS5hdXRoMC5jb20w
ggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7KXYurZ3HGWrxmcfzH+Zc
xeDSt5CqP37CFE6q5WWrjzGXhada7iXKo7/FyLxinA3GXp0kqg53X9EsjLjru/BK
PJa9BDlTYnN/ZUdI471ZLOsbAOwQW4RQ26w2f0H4qrsRujIa7YfxcMT3q6cez0B3
a/M/qNsrZKALjSaA2yMpfpmfeNF8W17V8gn9yzO4csYIBYHcs00w0cKclcbOTv2E
p0A4mJhNPxjj/M9v6esl75ripkJKPUvQR5iahfESj2Qe+YxqEM8kCqkLup7oTls3
4vsZO+XmcFzCITIucRlTNkMCVrb1TdEmmUmuQVrW2jQtpOERui1k7rUe7mExJhKv
AgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFHHAO8uB+nut/Aus
vqxeSPho1lftMA4GA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEATagK
2So6NGzRDaKU+DOGH563ic5lD6LUyz57ENP94hHgG84skdKcj01fMcadXDxf9s1U
vCcKUZ8WWBCjcZSguDtiDjRJVs/y5Z4ZcTTLIHufHRIStIM6W3AYsVhY4RKeDFke
oO+9dqP3mCkLOjgD1s2fkg5lsHDHdgdBPCTAwYpHnDgxfs/E+4JtKqXuyRDIvsGW
bPXwhJLbOIkwuf/1AfTfw+fNuNgonqkfNWeFnN9Sxu1KuDAjvK+AQkD+UL83vXh0
J0CsBtRDXwdIVMyfUUcQ6EgqI4FEdbT8xsNv7u+yB9nScJKYk/ECYsiZPK6uKelb
Hl5ZdhwcBukVnT0Owg==
-----END CERTIFICATE-----`

export const handler = async (  event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    logger.info('User authorized', jwtToken)
    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.info('User not authorized', { error: e.message })
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')
  const split = authHeader.split(' ')
  const token = split[1]
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
