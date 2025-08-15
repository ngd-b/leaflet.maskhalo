import type { Feature, FeatureCollection, MultiPolygon } from "geojson";
import "leaflet";

declare global {
  interface Window {
    L?: typeof L;
  }
  namespace L {
    type HaloData =
      | FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon>
      | Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>
      | Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>[]
      | GeoJSON.Polygon
      | GeoJSON.MultiPolygon
      | GeoJSON.Polygon[]
      | GeoJSON.MultiPolygon[];

    interface MaskHaloOptions {
      mask?: L.PathOptions;
      halo?: L.PathOptions;
    }

    class MaskHalo extends L.FeatureGroup {
      constructor(data: HaloData, options?: L.MaskHaloOptions);
      setHalo(data: HaloData): MaskHalo;
    }

    interface Map {
      maskHalo(data: HaloData, options?: MaskHaloOptions): MaskHalo;
    }

    function maskHalo(data: HaloData, options?: MaskHaloOptions): MaskHalo;
  }
}
