import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import * as AWSXRay from 'aws-xray-sdk'
import { updateAttachment } from '../../businessLogic/todo'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const imageId = uuid.v4()
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const url = getUploadUrl(imageId)
  const imagePath= "https://"+bucketName+".s3.us-east-2.amazonaws.com/"+imageId;
  const sUpdated = await updateAttachment(imagePath, todoId,jwtToken)
  if(sUpdated.toString() == "updated")
  {
    return {
      statusCode: 200,
      headers: {
          "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(
        {
          uploadUrl: url
        }
      )
    }
  }
  else
  {
    return {
      statusCode: 500,
      headers: {
          "Access-Control-Allow-Origin": "*",
      },
      body: 
      "Unable to update attachment"
    }
  }
 
  function getUploadUrl(imageId: string) {
    s3.deleteObject()
    
    return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: imageId,
      Expires: parseInt(urlExpiration)
    })
  }
  
}