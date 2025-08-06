import * as L from "leaflet";
import type { GeoJsonObject } from "geojson";

declare module "leaflet" {
  interface MaskHaloOptions {
    mask?: L.PathOptions;
    halo?: L.PathOptions;
  }

  class MaskHalo {
    constructor(map: L.Map, options?: MaskHaloOptions);
    addHalo(data: GeoJsonObject | GeoJsonObject[]): void;
    remove(): void;
  }

  interface Map {
    maskHalo(options?: MaskHaloOptions): MaskHalo;
  }
}