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
