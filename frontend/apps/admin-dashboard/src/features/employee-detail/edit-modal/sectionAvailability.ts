import type { ModalSectionKey } from './types';

const AVAILABLE_MODAL_SECTION_KEYS: ModalSectionKey[] = ['personal'];

export const isModalSectionAvailable = (section: ModalSectionKey): boolean =>
  AVAILABLE_MODAL_SECTION_KEYS.includes(section);
