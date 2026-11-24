const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type State = 'idle' | 'sending' | 'sent' | 'error';

const MESSAGES: Record<State, string> = {
  idle: 'Goes straight to my inbox. I reply by email.',
  sending: 'Sending…',
  sent: 'Sent. I will reply by email.',
  error: 'Could not send it. Please try again later, or reach me on LinkedIn.',
};

export function validate(email: string, message: string): string | null {
  if (!EMAIL.test(email.trim())) return 'Please enter a valid email address.';
  if (message.trim().length < 10) return 'Please write a few words about what you need.';
  return null;
}

export function startContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  const status = document.querySelector<HTMLElement>('[data-contact-status]');
  if (!form || !status) return;

  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  const show = (state: State, text = MESSAGES[state]) => {
    status.textContent = text;
    status.dataset.state = state;
    if (button) button.disabled = state === 'sending';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const email = String(data.get('email') ?? '');
    const message = String(data.get('message') ?? '');

    const problem = validate(email, message);
    if (problem) {
      show('error', problem);
      return;
    }

    show('sending');
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      if (!response.ok) throw new Error(`status ${response.status}`);
      form.reset();
      show('sent');
    } catch {
      show('error');
    }
  });
}
