import { todosService } from '@/services/todos.service';
import { TodoBoard } from '@/components/Todos/TodoBoard';
import type { Todo } from '@/db/schema';

export default async function Home() {
  let todos: Todo[] = [];
  let loadError: string | null = null;

  try {
    todos = await todosService.getTodos();
  } catch {
    loadError = 'Не удалось загрузить список задач. Проверьте подключение к базе.';
  }

  return (
    <div className="h-full w-full bg-zinc-50 p-4 dark:bg-black">
      <TodoBoard initialTodos={todos} loadError={loadError} />
    </div>
  );
}
