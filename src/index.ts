// src/index.ts
import * as L from "leaflet";
import {
  difference,
  featureCollection,
  feature,
  bboxPolygon,
} from "@turf/turf";
import "./leaflet.maskhalo";
import type {
  BBox,
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from "geojson";

const WORD_BBOX: BBox = [-180, -85.05112877980659, 180, 85.05112877980659];
const world: Feature<Polygon> = bboxPolygon(WORD_BBOX);

/**
 * Leaflet MaskHalo
 * @class
 * @param {L.Map} map - Leaflet map instance
 * @param {Object} options - Leaflet MaskHalo options
 *
 * @example
 *
 * ```
 * import L from "leaflet";
 * import "leaflet.maskhalo";
 * 
 * const maskHalo = L.maskHalo(data, {
    mask: {
      fillColor: "#000",
        fillOpacity: 0.4,
      },
      halo: {
        color: "#165DFF",
        weight: 3,
      },
    });
 *  
 * maskHalo.addTo(map);
 * 
 * // 清除
 * maskHalo.clearLayers()
 * // 移除当前的
 * maskHalo.remove()
 * ```
 */
export class MaskHalo extends L.FeatureGroup {
  private _options: Required<L.MaskHaloOptions>;
  private _halo: L.GeoJSON | null = null;
  private _mask: L.GeoJSON | null = null;

  constructor(data: L.HaloData, options?: L.MaskHaloOptions) {
    super();

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

    this._createLayers(data);
  }
  /**
   * Add halo to the map
   *
   * @param data GeoJSON data
   *
   */
  _createLayers(data: L.HaloData): void {
    let collection = featureCollection<Polygon | MultiPolygon>([]);
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.type == "Feature") {
          if (["Polygon", "MultiPolygon"].includes(item.geometry.type)) {
            collection.features.push(item);
          }
        } else if (["Polygon", "MultiPolygon"].includes(item.type)) {
          collection.features.push(feature(item));
        }
      }
    } else {
      switch (data.type) {
        case "FeatureCollection":
          const features = data.features.filter((item) =>
            ["Polygon", "MultiPolygon"].includes(item.geometry.type)
          );
          collection = featureCollection(features);
          break;
        case "Feature":
          if (["Polygon", "MultiPolygon"].includes(data.geometry.type)) {
            collection = featureCollection([data]);
          }
          break;
        case "Polygon":
        case "MultiPolygon":
          collection = featureCollection([feature(data)]);
          break;
        default:
      }
    }
    if (collection.features.length < 1) {
      console.warn("【leaflet.maskhalo】 No valid polygon data to show.");
      return;
    }
    this._halo = L.geoJSON(collection, { style: { ...this._options.halo } });

    const mask = difference(featureCollection([world, ...collection.features]));

    if (!mask) {
      console.warn(
        "【leaflet.maskhalo】 Mask computation failed. Please check geometry data. "
      );
      return;
    }
    this._mask = L.geoJSON(mask, {
      style: {
        ...this._options.mask,
      },
    });

    this.addLayer(this._mask);
    this.addLayer(this._halo);
  }
  /**
   * Remove the mask layer.
   *
   */
  setHalo(data: L.HaloData): this {
    this.clearLayers();
    this._createLayers(data);
    return this;
  }
}

// 工厂函数：小写，返回实例
export function maskHalo(
  data: L.HaloData,
  options?: L.MaskHaloOptions
): L.MaskHalo {
  return new MaskHalo(data, options);
}

// 使用 Leaflet 的插件机制
L.Map.addInitHook(function (this: L.Map) {
  // @ts-ignore
  this.maskHalo = (
    data: L.HaloData,
    options?: L.MaskHaloOptions
  ): L.MaskHalo => {
    return new MaskHalo(data, options);
  };
});

if (typeof window !== "undefined" && window.L) {
  window.L.MaskHalo = MaskHalo;
  window.L.maskHalo = maskHalo;
}
