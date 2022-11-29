import { LatLngTuple } from "leaflet";

export enum MediaType {
  Book = 'Book',
  Film = 'Film',
  Television = 'Television'
};

export enum MediaInstallment {
  Book = 'Chapter',
  Film = 'Installment',
  Television = 'Episode'
};

export type Series = {
  title: string;
  stub: string;
  image: string;
  color: string;
  backgroundColor: string;
  installments: Installment[];
  characters: Character[];
  planetName?: string;
  timeframe?: string;
  description?: string;
};

export type Installment = {
  title: string;
  type: MediaType;
  image: string;
  chapters: Chapter[];
};

export type Chapter = {
  chapter: number;
  altName?: string;
  part?: number;
};

export type Character = {
  name: string;
  image: string;
  color: string;
  wikiLink?: string;
  firstAppearance?: { [x: number]: Chapter }
};

// MAP TYPES

export type Map = {
  image: any;
  altImage?: any;
  source?: string;
  dimensions: LatLngTuple;
};

export type Marker = {
  title: string;
  coordinates: L.LatLngTuple;
  type: 'planet' | 'region' | 'city' | 'town' | 'event' | 'battle' | 'point of interest';
  image?: string;
  appearances: { [x: number]: Chapter[] };
  description?: string;
  wikiLink?: string;
  confirmed: boolean;
};

export type Path = {
  character: Character;
  installment: Installment;
  chapter: Chapter;
  confirmed: boolean;
  coordinates: L.LatLngTuple[];
};

export type DataBundle = Series & {
  map: Map,
  markers: Marker[],
  paths: Path[]
}
