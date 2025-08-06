// src/index.ts
import * as L from "leaflet";
import * as turf from "@turf/turf";
import type { GeoJsonObject, Feature, Polygon, MultiPolygon } from "geojson";

const world = turf.polygon([
  [
    [-180, -90],
    [180, -90],
    [180, 90],
    [-180, 90],
    [-180, -90],
  ],
]);

export class MaskHalo {
  private _map: L.Map;
  private _options: Required<L.MaskHaloOptions>;
  private _halo: L.GeoJSON | null = null;
  private _mask: L.GeoJSON | null = null;

  constructor(map: L.Map, options?: L.MaskHaloOptions) {
    this._map = map;
    this._options = {
      mask: {
        color: "transparent",
        weight: 0,
        fillColor: "#000",
        fillOpacity: 0.3,
        ...options?.mask,
      },
      halo: {
        color: "#165DFF",
        weight: 2,
        fillColor: "transparent",
        fillOpacity: 0,
        ...options?.halo,
      },
    };
  }
  addHalo(data: GeoJsonObject | GeoJsonObject[]): void {
    this._halo = L.geoJSON(data, { style: { ...this._options.halo } });

    // Convert data to Feature type that turf can work with
    const features = Array.isArray(data) ? data : [data];
    const polygonFeatures = features.map(feature => {
      // 将 GeoJsonObject 转换为 Polygon 或 MultiPolygon 类型的 Feature
      return turf.feature(feature as any) as Feature<Polygon | MultiPolygon>;
    });

    const mask = turf.difference(turf.featureCollection([world as any, ...polygonFeatures]));

    this._mask = L.geoJSON(mask, {
      style: {
        ...this._options.mask,
      },
    });

    this._mask.addTo(this._map);
    this._halo.addTo(this._map);
  }
  remove(): void {
    if (this._halo) {
      this._halo.remove();
    }
    if (this._mask) {
      this._mask.remove();
    }
  }
}

// 正确扩展 Leaflet 命名空间
declare module "leaflet" {
  interface Map {
    maskHalo(options?: L.MaskHaloOptions): L.MaskHalo;
  }
}

// 使用 Leaflet 的插件机制
L.Map.addInitHook(function (this: L.Map) {
  // @ts-ignore
  this.maskHalo = (options?: L.MaskHaloOptions): L.MaskHalo => {
    return new MaskHalo(this, options);
  };
});