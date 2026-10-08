'use client';

import { useState } from 'react';

type DeleteTodoConfirmProps = {
  title?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => Promise<void>;
};

export function DeleteTodoConfirm({
  title,
  onConfirm,
  onCancel,
}: DeleteTodoConfirmProps) {
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-2 w-full max-w-sm rounded-md border-2 border-red-500 bg-red-50 p-4 text-black">
      <p className="text-sm font-semibold text-red-800">
        Это действие нельзя отменить
      </p>
      <p className="mt-1 text-sm text-red-700">
        Задача{title ? ` «${title}»` : ''} будет удалена навсегда. Восстановить её
        будет нельзя.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => run(onConfirm)}
          className="rounded-md bg-red-600 px-4 py-3 text-base font-bold uppercase tracking-wide text-white shadow-md hover:bg-red-700 disabled:opacity-50"
        >
          {busy ? 'Удаление...' : 'Подтвердить удаление'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => run(onCancel)}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
