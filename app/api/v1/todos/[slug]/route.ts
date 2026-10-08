import { NextResponse } from 'next/server';
import { todosService } from '@/services/todos.service';

export async function GET(
  _request: Request,
  { params }: RouteContext<'/api/v1/todos/[slug]'>,
) {
  const { slug } = await params;
  const todo = await todosService.getTodosById(parseInt(slug, 10));
  return NextResponse.json(todo);
}

export async function PUT(
  request: Request,
  { params }: RouteContext<'/api/v1/todos/[slug]'>,
) {
  const { slug } = await params;
  const body = await request.json();
  const todo = await todosService.setStatusTodo(
    parseInt(slug, 10),
    Boolean(body.completed),
  );
  return NextResponse.json(todo);
}

export async function DELETE(
  request: Request,
  { params }: RouteContext<'/api/v1/todos/[slug]'>,
) {
  const { slug } = await params;
  const responce = await todosService.deleteTodoById(parseInt(slug, 10));
  return NextResponse.json(responce);
}
