import fs from 'node:fs';
import path from 'node:path';

import { slash } from '@vessel-js/app/http';

import type { SidebarLink, SidebarLinks } from '../layouts/sidebar/context';
import { formatElementHeading } from '../stores/format';
import { kebabToTitleCase } from '../utils/string';

export function loadPlayerSidebar(): SidebarLinks {
  const include = /\/(_|page)\.md/;
  const exclude = /\[lib=|\/cdn/;
  const stripRootPathRE = /^(.*?)\[lib\]\/player/;

  const files = readDirDeepSync('app/docs/[lib]/player', include, exclude).map((file) =>
    file.replace(stripRootPathRE, ''),
  );

  const slugs = files
    .map(stripRouteOrder)
    .map((path) => stripRouteOrder(path).replace(include, ''));

  return {
    'Getting Started': links(slugs, /^\/getting-started/),
    'Core Concepts': links(slugs, /^\/core-concepts/),
    Providers: links(slugs, /^\/providers/),
    API: links(slugs, /^\/api/),
    Components: links(slugs, /^\/components/),
  };
}

const WIP = new Set(['Architecture', 'Accessibility', 'User']);

function links(slugs: string[], filter: RegExp): SidebarLink[] {
  return slugs
    .filter((slug) => filter.test(slug))
    .map((slug) => {
      const title = formatElementHeading(
        kebabToTitleCase(slug.split('/').pop()!).replace('Hls', 'HLS').replace('Pip', 'PIP'),
      );

      return {
        title,
        slug: `/docs/player${slug}`,
        wip: WIP.has(title),
      };
    });
}

const STRIP_ROUTE_ORDER_RE = /\/\[(\d+)\]/g;
function stripRouteOrder(filePath: string) {
  return filePath.replace(STRIP_ROUTE_ORDER_RE, '/');
}

function sortOrderedPageFiles(files: string[]): string[] {
  return files
    .map(slash)
    .sort((fileA, fileB) => {
      return calcPageOrderScore(fileA) - calcPageOrderScore(fileB);
    })
    .map(stripRouteOrder);
}

function calcPageOrderScore(filePath: string): number {
  let score = 1;

  for (const matches of filePath.matchAll(STRIP_ROUTE_ORDER_RE) ?? []) {
    score *= Number(matches[1]);
  }

  return score;
}

function readDirDeepSync(dir: string, include: RegExp, exclude: RegExp) {
  const files: string[] = [];

  for (const file of fs.readdirSync(dir)) {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      files.push(...readDirDeepSync(filePath, include, exclude));
    } else if (include.test(filePath) && !exclude.test(filePath)) {
      files.push(filePath);
    }
  }

  return files;
}
