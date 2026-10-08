import { NextResponse } from 'next/server';
import { todosService } from '@/services/todos.service';

export async function GET() {
  const todos = await todosService.getTodos();
  return NextResponse.json(todos);
}

export async function POST(request: Request) {
  const body = await request.json();
  const todo = await todosService.createTodo(body);
  return NextResponse.json(todo);
}
