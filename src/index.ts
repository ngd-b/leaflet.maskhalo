// src/index.ts
import * as L from "leaflet";
import * as turf from "@turf/turf";
import type {
  Feature,
  Polygon,
  MultiPolygon,
  FeatureCollection,
} from "geojson";

const world: Feature<Polygon> = turf.polygon([
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
  addHalo(data: FeatureCollection<Polygon | MultiPolygon>): void {
    this._halo = L.geoJSON(data, { style: { ...this._options.halo } });

    const mask = turf.difference(
      turf.featureCollection([world, ...data.features])
    );

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

// 使用 Leaflet 的插件机制
L.Map.addInitHook(function (this: L.Map) {
  // @ts-ignore
  this.maskHalo = (options?: L.MaskHaloOptions): L.MaskHalo => {
    return new MaskHalo(this, options);
  };
});
