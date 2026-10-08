'use client';

import { FormEvent, useState } from 'react';

type CreateTodoChatFormProps = {
  initialTitle?: string;
  initialDescription?: string;
  onCreate: (title: string, description: string) => Promise<void>;
};

export function CreateTodoChatForm({
  initialTitle = '',
  initialDescription = '',
  onCreate,
}: CreateTodoChatFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);

  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !saving;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    try {
      await onCreate(title.trim(), description.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 flex w-full max-w-sm flex-col gap-2 rounded-md border border-zinc-200 bg-white p-3 text-black"
    >
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Название"
        required
        className="rounded-md border border-zinc-300 px-3 py-2"
      />
      <input
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Описание"
        required
        className="rounded-md border border-zinc-300 px-3 py-2"
      />
      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded-md bg-zinc-900 px-3 py-2 text-white disabled:opacity-50"
      >
        {saving ? 'Сохранение...' : 'Create'}
      </button>
    </form>
  );
}
