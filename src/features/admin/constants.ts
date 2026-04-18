import { PageDefinition } from './types';

export const AVAILABLE_PAGES: PageDefinition[] = [
  { id: 'polls', name: 'Polls', path: '/polls' },
  { id: 'qbs', name: 'QBS', path: '/qbs' },
  { id: 'drafts', name: 'Drafts', path: '/drafts' },
  { id: 'formats', name: 'Formats', path: '/channel-formats' },
  { id: 'csv-modifier', name: 'CSV Modifier', path: '/csv-modifier' }
];
