import type { ModalSectionKey } from './types';

const AVAILABLE_MODAL_SECTION_KEYS: ModalSectionKey[] = ['personal', 'work', 'leave', 'asset'];

export const isModalSectionAvailable = (section: ModalSectionKey): boolean =>
  AVAILABLE_MODAL_SECTION_KEYS.includes(section);
