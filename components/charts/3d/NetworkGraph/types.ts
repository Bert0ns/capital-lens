import { EtfConfig } from '@/lib/types';

export interface NetworkGraphProps {
  etfs: EtfConfig[];
  limit: number[];
  livePhysics: boolean;
  overlapOnly?: boolean;
}

export interface NodeObj {
  id?: string;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  name?: string;
  group?: 'etf' | 'holding';
  val?: number;
  [key: string]: unknown;
}

export interface LinkObj {
  source?: string | NodeObj;
  target?: string | NodeObj;
  value?: number;
  [key: string]: unknown;
}
