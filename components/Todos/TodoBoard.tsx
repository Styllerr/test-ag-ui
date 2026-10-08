'use client';

import { FormEvent, useState } from 'react';
import type { Todo } from '@/db/schema';
import {
  useFrontendTool,
  useAgentContext,
  useHumanInTheLoop,
  ToolCallStatus,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { CreateTodoChatForm } from "@/components/Todos/CreateTodoChatForm";
import { DeleteTodoConfirm } from "@/components/Todos/DeleteTodoConfirm";

type TodoBoardProps = {
  initialTodos: Todo[];
  loadError?: string | null;
};

export function TodoBoard({ initialTodos, loadError = null }: TodoBoardProps) {
  const [todos, setTodos] = useState(initialTodos);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(loadError);


  useAgentContext({
    description:
      "Current todo list on the Home page. Use this when the user asks about todos or wants to toggle or delete one. To create a todo, call create_todo only when both title and description are known. If description is missing, call create_todo_form. To delete a todo, always call delete_todo and wait for the user to confirm in chat.",
    value: todos.map(({ id, title, description, completed }) => ({
      id,
      title,
      description,
      completed,
    })),
  });

  const fetchNewTodo = async (title: string, description: string): Promise<Todo> => {
    try {
      const response = await fetch('/api/v1/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error('Не удалось создать задачу');
      }
      const data = await response.json();
      return data as Todo;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка создания');
      throw new Error('Ошибка создания');
    }
  };

  const fetchToggleTodo = async (id: number, completed: boolean): Promise<Todo> => {
    try {
      const response = await fetch(`/api/v1/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить статус');
      }
      return (await response.json()) as Todo;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления');
      throw new Error('Ошибка обновления');
    } finally {
      setSaving(false);
    }
  };

  const fetchDeleteTodo = async (id: number): Promise<{ deletedId: number }> => {
    const response = await fetch(`/api/v1/todos/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Не удалось удалить задачу');
    }

    return (await response.json()) as { deletedId: number };
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle || saving) return;

    setSaving(true);
    setError(null);

    try {
      const created: Todo = await fetchNewTodo(title, description);
      setTodos((current) => [...current, created]);
      setTitle('');
      setDescription('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка создания');
    } finally {
      setSaving(false);
    }
  };


  const handleToggle = async (todo: Todo) => {
    const nextCompleted = !todo.completed;
    const updated: Todo = await fetchToggleTodo(todo.id, nextCompleted);
    setTodos((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const handleDelete = async (todo: Todo) => {
    setError(null);
    try {
      await fetchDeleteTodo(todo.id);
      setTodos((current) => current.filter((item) => item.id !== todo.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  useFrontendTool({
    name: "create_todo",
    description:
      "Create a todo immediately. Call ONLY when the user already gave both a non-empty title and a non-empty description. If description is missing, call create_todo_form instead.",
    parameters: z.object({
      title: z.string().min(1).describe("The title of the todo"),
      description: z.string().min(1).describe("The description of the todo"),
    }),
    handler: async ({ title, description }: { title: string; description: string }) => {
      const nextTitle = title.trim();
      const nextDescription = description.trim();
      if (!nextTitle || !nextDescription) {
        return JSON.stringify({
          ok: false,
          reason: "missing_fields",
          hint: "Call create_todo_form to collect title and description",
        });
      }

      const created: Todo = await fetchNewTodo(nextTitle, nextDescription);
      setTodos((current) => [...current, created]);
      return JSON.stringify({ ok: true, id: created.id, title: created.title });
    },
  });

  useHumanInTheLoop({
    name: "create_todo_form",
    description:
      "Show a chat form with title and description inputs. Use this when the user wants to create a todo but did not provide a description.",
    parameters: z.object({
      title: z
        .string()
        .optional()
        .describe("Title if the user already mentioned one"),
      description: z
        .string()
        .optional()
        .describe("Description if any part of it is already known"),
    }),
    render: ({ status, args, respond }) => {
      if (status === ToolCallStatus.InProgress) {
        return <p className="text-sm text-zinc-500">Открываем форму…</p>;
      }

      if (status === ToolCallStatus.Executing && respond) {
        return (
          <CreateTodoChatForm
            initialTitle={args.title ?? ""}
            initialDescription={args.description ?? ""}
            onCreate={async (nextTitle, nextDescription) => {
              const created = await fetchNewTodo(nextTitle, nextDescription);
              setTodos((current) => [...current, created]);
              await respond({
                ok: true,
                id: created.id,
                title: created.title,
                description: created.description,
              });
            }}
          />
        );
      }

      return <p className="text-sm text-zinc-500">Задача создана</p>;
    },
  });

  useFrontendTool({
    name: "toggle_todo_status",
    description: "Function for toggle todo status",
    parameters: z.object({
      id: z.int().describe("Id of the todo to toggle status"),
      completed: z.boolean().describe("New status for the todo"),
    }),
    handler: async ({ id, completed }: { id: number, completed: boolean }) => {
      const chenged: Todo = await fetchToggleTodo(id, completed)
      console.log("🚀 ~ TodoBoard ~ chenged:", chenged)
      setTodos((current) =>
        current.map((item) => (item.id === chenged.id ? chenged : item)));
      return `Set status ${completed} for todo ${id}!`
    }
  },
  );

  useHumanInTheLoop({
    name: "delete_todo",
    description:
      "Ask the user to confirm deleting a todo. Always use this for deletions. Do not delete until the user confirms in the chat UI. This action cannot be undone.",
    parameters: z.object({
      id: z.int().describe("Id of the todo to delete"),
      title: z.string().optional().describe("Title of the todo, if known"),
    }),
    render: ({ status, args, respond }) => {
      if (status === ToolCallStatus.InProgress) {
        return <p className="text-sm text-zinc-500">Готовим подтверждение…</p>;
      }

      if (status === ToolCallStatus.Executing && respond) {
        const todoTitle =
          args.title ??
          todos.find((item) => item.id === args.id)?.title ??
          `#${args.id}`;

        return (
          <DeleteTodoConfirm
            title={todoTitle}
            onConfirm={async () => {
              await fetchDeleteTodo(args.id);
              setTodos((current) =>
                current.filter((item) => item.id !== args.id),
              );
              await respond({
                ok: true,
                confirmed: true,
                deletedId: args.id,
              });
            }}
            onCancel={async () => {
              await respond({
                ok: false,
                confirmed: false,
                deletedId: args.id,
              });
            }}
          />
        );
      }

      return <p className="text-sm text-zinc-500">Готово</p>;
    },
  });

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <h2 className="text-xl font-semibold">Todos</h2>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Название"
          required
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
        />
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Описание"
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
        />
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Добавить'}
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {todos.length === 0 ? (
        <p className="text-sm text-zinc-500">Список пуст</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-start gap-3 rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo)}
                className="mt-1 h-4 w-4 cursor-pointer"
              />
              <div className="min-w-0 flex-1">
                <p
                  className={
                    todo.completed
                      ? 'font-medium text-zinc-400 line-through'
                      : 'font-medium'
                  }
                >
                  {todo.title}
                </p>
                {todo.description ? (
                  <p className="text-sm text-zinc-500">{todo.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(todo)}
                aria-label={`Удалить ${todo.title}`}
                className="mt-0.5 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6m2 0v13.5A1.5 1.5 0 0 1 16.5 21h-9A1.5 1.5 0 0 1 6 19.5V6m3 4.5v7m6-7v7"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
