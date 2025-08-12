import type { Feature, FeatureCollection } from "geojson";
import "leaflet";

declare module "leaflet" {
  interface MaskHaloOptions {
    mask?: L.PathOptions;
    halo?: L.PathOptions;
  }

  class MaskHalo {
    constructor(map: L.Map, options?: MaskHaloOptions);
    addHalo(
      data:
        | FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon>
        | Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>
        | Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>[]
        | GeoJSON.Polygon
        | GeoJSON.MultiPolygon
        | GeoJSON.Polygon[]
        | GeoJSON.MultiPolygon[]
    ): void;
    remove(): void;
  }

  interface Map {
    maskHalo(options?: MaskHaloOptions): MaskHalo;
  }
}
