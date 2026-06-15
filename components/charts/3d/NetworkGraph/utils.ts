import { NodeObj } from './types';

export const getLinkId = (node: string | NodeObj | undefined): string | undefined =>
  typeof node === 'object' && node !== null ? node.id : (node as string | undefined);
