import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../helper/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { getUserId } from '../auth/utils'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
const todoAccess = new TodoAccess()

export async function getAllTodo(jwtToken: string): Promise<TodoItem[]> {
  return todoAccess.getAllTodo(getUserId(jwtToken))
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const userId = getUserId(jwtToken)
  return await todoAccess.createTodoRequest({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: "none"
  })
}

export async function getTodo(
  todoId: string, jwtToken: string
): Promise<TodoItem> {
  return todoAccess.getTodo(todoId, getUserId(jwtToken))
}

export async function deleteTodo(
  todoId: string, jwtToken: string
): Promise<Boolean> {
  return todoAccess.deleteTodo(todoId, getUserId(jwtToken))
}

export async function updateTodo(
    todoUpdateRequest: UpdateTodoRequest,
    todoId: string, jwtToken: string
): Promise<TodoItem> {
    return todoAccess.updateTodoRequest(todoId, 
      todoUpdateRequest.name, 
      todoUpdateRequest.dueDate,
      Boolean(todoUpdateRequest.done), getUserId(jwtToken))
}

export async function updateAttachment(
  imagePath: string, todoId: string, jwtToken: string
):Promise<string> {
  return todoAccess.updateAttachment(todoId, imagePath, getUserId(jwtToken))
}
