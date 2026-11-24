/** Answers to commands a visitor should not run here. Kept from the 2021 version of the site. */
export const REFUSALS = [
  'Nice try... (ಠ(ಠ(ಠ_ಠ)ಠ)ಠ)',
  'Not happening... ^_^',
  'Not on my watch... (ಠ_ಠ)',
  "Don't make me mad ... x_x",
  'Do you wanna get hacked? ... (ಠ(ಠ_ಠ)ಠ)',
  'STOP MESSING WITH MY WEBSITE !!!',
  'You are too curious :D',
  "Go away or I'll call the police !!!",
  "It's not that easy to hack me ;)",
  'Nice try, but you should try harder ;)',
  'Who do you think I am?',
  'Too bad I got your IP address, be careful now ;)',
  'به چه زبونی بگم نکن!!!',
];

export const FORBIDDEN = ['sudo', 'su', 'reboot', 'shutdown', 'kill', 'chmod', 'chown', 'chroot', 'npm', 'rm', 'mkdir', 'touch', 'vim', 'nano'];

export function refusal(rand: () => number): string {
  return REFUSALS[Math.floor(rand() * REFUSALS.length)] ?? REFUSALS[0]!;
}

export function ping(host: string, rand: () => number): string[] {
  const ip = '203.0.113.42';
  const times = Array.from({ length: 4 }, () => 8 + rand() * 6);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  return [
    `PING ${host} (${ip}) 56(84) bytes of data.`,
    ...times.map((t, i) => `64 bytes from ${host} (${ip}): icmp_seq=${i + 1} ttl=57 time=${t.toFixed(1)} ms`),
    '',
    `--- ${host} ping statistics ---`,
    '4 packets transmitted, 4 received, 0% packet loss',
    `rtt min/avg/max = ${Math.min(...times).toFixed(1)}/${avg.toFixed(1)}/${Math.max(...times).toFixed(1)} ms`,
  ];
}
