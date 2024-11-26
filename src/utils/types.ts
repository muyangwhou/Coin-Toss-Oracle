export interface ChingDto {
  number: number;
  name: string;
  pinyin: string;
  meaning: string;
  interpretations: string[];
}

export interface ShintoDto {
  level: string;
  meaning: string;
  advice: string;
  color: string;
}
export interface CelticDto {
  symbol: string;
  name: string;
  meaning: string;
}
export interface JudaismDto {
  title: string;
  meaning: string;
}
export interface EgyptDto {
  side: string;
  symbol: string;
  meaning: string;
  description: string;
}

export interface AfricanDto {
  symbol: JSX.Element;
  name: string;
  meaning: string;
}

export interface NativeAmericanDto {
  name: string;
  meaning: string;
}

export interface MayanDto {
  name: string;
  meaning: string;
  energy: string;
}

export interface PayloadDto {
  transactionHash: string;
  chainId: number;
  currency: string;
  theme: string;
}

export interface LeaderBoardDto {
  rank?: number;
  walletId: string;
  tokensBurned: number;
  chainId: number;
  currency: string;
  walletAddress: string;
}

export type ChristianResponse = {
  message: string;
  verse: string;
};

export type CategoryResponses = {
  [key: string]: ChristianResponse[];
};

export type SideResponses = {
  [key: string]: CategoryResponses;
};

export interface ChristianDto {
  response: ChristianResponse;
  category: string;
}
