import * as AWS  from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)
import { TodoItem } from '../models/TodoItem'
export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODO_TABLE) {
  }
  async getAllTodo(userId: String): Promise<TodoItem[]> {
    var params = {
        TableName: this.todoTable,
        KeyConditionExpression: "#u = :userId",
        ExpressionAttributeNames: {
            "#u": "userId",
        },
        ExpressionAttributeValues: {
              ":userId": userId
        }
    };
    const result = await this.docClient.query(params).promise();
    return result.Items as TodoItem[]
  }
  async getTodo(todoId: String, userId: String): Promise<TodoItem> {
    var params = {
        TableName: this.todoTable,
        KeyConditionExpression: "#u = :userId and #id = :todoId",
        ExpressionAttributeNames: {
            "#id": "todoId",
            "#u": "userId"
        },
        ExpressionAttributeValues: {
              ":userId": userId,
              ":todoId": todoId
        }
    };
    const result = await this.docClient.query(params).promise();
    return result.Items[0] as TodoItem
  }

  async createTodoRequest(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise()
    return todo
  }

  async updateTodoRequest(todoId: String, name: String, dueDate: String, done: Boolean, userId: String): Promise<TodoItem> {
    var params = {
      TableName: this.todoTable,
      Key:{
          "todoId": todoId,
          "userId": userId
      },
      UpdateExpression: "set #a = :a, #b = :b, #c = :c",
      ExpressionAttributeNames: {
          "#a": "name",
          "#b": "dueDate",
          "#c": "done"
      },
      ExpressionAttributeValues: {
          ":a": name,
          ":b": dueDate,
          ":c": done
      },
      ReturnValues:"ALL_NEW"
    };
    const result = await this.docClient.update(params).promise();
    const updatedAttr = result.Attributes;
    return updatedAttr as TodoItem;
  }
  
  async updateAttachment(todoId: string, imagePath: string, userId: String): Promise<string>
  {
    const result = await this.docClient.update({
      TableName: this.todoTable,
      Key:{
        "todoId": todoId,
        "userId": userId
        },
        UpdateExpression: "set attachmentUrl = :value",
        ExpressionAttributeValues:{
          ":value": imagePath
        },
        ReturnValues:"ALL_NEW"
      }).promise();
      if(result.Attributes) 
        return "updated" as string
      else
        return "error" as string
  }

  async deleteTodo(todoId: string, userId: String): Promise<Boolean> {
      await this.docClient.delete({
      TableName: this.todoTable,
      Key:{
        "todoId": todoId,
        "userId": userId
      },
        ConditionExpression:"todoId= :val",
        ExpressionAttributeValues: {
          ":val": todoId
      }
    }).promise()
    return true
  }
}

  function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
}
