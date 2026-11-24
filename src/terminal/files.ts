import type { Site } from '../content/site.ts';
import { yearsSince } from '../lib/years.ts';
import { shortHash } from '../render/work.ts';
import { dir, file, type FsNode } from './vfs.ts';

/** The home directory, generated from the same content as the page. */
export function homeDir(site: Site, now: Date): FsNode {
  const years = yearsSince(site.careerStart, now);
  const intro = site.intro.replace('{years}', String(years));

  const services: Record<string, FsNode> = {};
  for (const s of site.services) {
    services[`${s.id}.md`] = file(`# ${s.title}\n\n${s.text}\n\nTools: ${s.tools.join(', ')}`);
  }

  const skills = site.services.map((s) => `${s.title.padEnd(16)}${s.tools.join(', ')}`).join('\n');

  return dir({
    'README.md': file(
      `Hi, I'm ${site.name.split(' ')[0]}. ${site.role}.\n\nThis is a small shell. Try ls, cd services, cat about.md, tree or help.`,
    ),
    'about.md': file(`# ${site.name}\n${site.role}\n\n${intro}`),
    services: dir(services),
    'work.log': file(site.work.map((w) => `${shortHash(w)} ${w}`).join('\n')),
    'experience.txt': file(site.experience.map((j) => `${j.period.padEnd(14)}${j.role}, ${j.org}`).join('\n')),
    'skills.txt': file(skills),
    'education.md': file(`${site.education.degree}\n${site.education.school}, ${site.education.year}`),
    'contact.txt': file(
      `Type mail to open the contact form.\n\n${site.links.map((l) => `${l.label.padEnd(10)}${l.href}`).join('\n')}`,
    ),
    '.hidden': dir({
      file1: file('Its a shame to look at other people hidden stuff!'),
      file2: file('And you are still doing it! (ಠ_ಠ)'),
      dir2: dir({ file: file('You should learn some manners, I am so disappointed :(') }),
      '.secrets': file('Nice try. The real secrets live in a vault, not on a website.'),
    }),
  });
}
