import { db } from '@/db';
import { type NewTodo, todos } from '@/db/schema';
import { eq } from 'drizzle-orm';

const getTodos = async () => {
  const todosList = await db.query.todos.findMany();
  return todosList;
};

const getTodosById = async (todoId: number) => {
  const todo = await db.query.todos.findFirst({
    where: { id: todoId },
  });
  return todo;
};

const createTodo = async (todo: NewTodo) => {
  const [newTodo] = await db.insert(todos).values(todo).returning();
  return newTodo;
};

const setStatusTodo = async (todoId: number, status: boolean) => {
  const [todo] = await db
    .update(todos)
    .set({ completed: status })
    .where(eq(todos.id, todoId))
    .returning();
  return todo;
};

const deleteTodoById = async (
  todoId: number,
): Promise<{ deletedId: number }> => {
  const [responce] = await db
    .delete(todos)
    .where(eq(todos.id, todoId))
    .returning({ deletedId: todos.id });
  return responce;
};

export const todosService = {
  getTodos,
  getTodosById,
  createTodo,
  setStatusTodo,
  deleteTodoById,
};
