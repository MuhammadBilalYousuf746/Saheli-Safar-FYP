// Feedback accepts display copy only, never API payloads, tokens or image data.
export function safeFeedbackMessage(value, fallback = 'Unable to complete this request. Please retry.') {
  if (typeof value !== 'string' || !value.trim() || /https?:\/\/|file:|content:|cloudinary|bearer\s|[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.|[A-Z]:\\|\/data\/|\/private\//i.test(value)) return fallback;
  return value.trim().slice(0, 600);
}
export function createNotificationStore() {
  let state = { dialog: null }, serial = 0, dialogResult;
  const listeners = new Set(), seen = new Set();
  const emit = dialog => { state = { dialog }; listeners.forEach(listener => listener(state)); };
  const open = (options, resolve) => {
    // No queue: feedback must never reappear later for another route/account.
    if (state.dialog || (options.key && seen.has(options.key))) { resolve?.(false); return null; }
    if (options.key) { seen.add(options.key); if (seen.size > 128) seen.delete(seen.values().next().value); }
    const type = ['success', 'error', 'warning', 'info', 'confirmation'].includes(options.type) ? options.type : 'info';
    dialogResult = resolve;
    const dialog = { id: ++serial, type, title: safeFeedbackMessage(options.title, 'Saheli Safar'),
      message: safeFeedbackMessage(options.message), primaryText: options.primaryText || 'Got It',
      secondaryText: options.secondaryText || 'Cancel', destructive: !!options.destructive,
      onConfirm: options.onConfirm, busy: false, error: '' };
    emit(dialog); return dialog.id;
  };
  const notify = options => open(options);
  const confirm = options => new Promise(resolve => open({ ...options, type: 'confirmation', primaryText: options.primaryText || 'Confirm' }, resolve));
  const dismissDialog = () => {
    if (!state.dialog || state.dialog.busy) return false;
    const done = dialogResult; dialogResult = null; emit(null); done?.(false); return true;
  };
  const acceptDialog = async () => {
    const dialog = state.dialog;
    if (!dialog || dialog.busy) return;
    emit({ ...dialog, busy: true, error: '' });
    try {
      const result = await dialog.onConfirm?.();
      if (state.dialog?.id !== dialog.id) return;
      if (result === false) throw new Error('Action failed');
      const done = dialogResult; dialogResult = null; emit(null); done?.(true);
    } catch {
      if (state.dialog?.id === dialog.id) emit({ ...dialog, busy: false, error: 'Unable to complete this action. Please retry or cancel.' });
    }
  };
  const clear = () => { const done = dialogResult; dialogResult = null; emit(null); done?.(false); };
  return { notify, confirm, dismissDialog, acceptDialog, clear, getState: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    dispose: () => { clear(); seen.clear(); listeners.clear(); } };
}
export const notifications = createNotificationStore();
