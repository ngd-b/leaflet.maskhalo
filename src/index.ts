// src/index.ts
import * as L from "leaflet";
import { polygon, difference, featureCollection, feature } from "@turf/turf";
import "./leaflet.maskhalo";
import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from "geojson";

const world: Feature<Polygon> = polygon([
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
  addHalo(
    data:
      | FeatureCollection<Polygon | MultiPolygon>
      | Feature<Polygon | MultiPolygon>
      | Feature<Polygon | MultiPolygon>[]
      | Polygon
      | MultiPolygon
      | Polygon[]
      | MultiPolygon[]
  ): void {
    let collection = featureCollection<Polygon | MultiPolygon>([]);
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.type == "Feature") {
          collection.features.push(item);
        } else {
          collection.features.push(feature(item));
        }
      }
    } else {
      switch (data.type) {
        case "FeatureCollection":
          collection = data;
          break;
        case "Feature":
          collection = featureCollection([data]);
          break;
        case "Polygon":
          collection = featureCollection([feature(data)]);
          break;
        case "MultiPolygon":
          collection = featureCollection([feature(data)]);
          break;
      }
    }
    if (collection.features.length < 1) {
      throw new Error("【leaflet.maskhalo】invalid data.");
    }
    this._halo = L.geoJSON(data, { style: { ...this._options.halo } });

    const mask = difference(featureCollection([world, ...collection.features]));

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
      this._halo = null;
    }
    if (this._mask) {
      this._mask.remove();
      this._mask = null;
    }
  }
}

// 工厂函数：小写，返回实例
export function maskHalo(map: L.Map, options?: L.MaskHaloOptions): L.MaskHalo {
  return new MaskHalo(map, options);
}

// 使用 Leaflet 的插件机制
L.Map.addInitHook(function (this: L.Map) {
  // @ts-ignore
  this.maskHalo = (options?: L.MaskHaloOptions): L.MaskHalo => {
    return new MaskHalo(this, options);
  };
});
