import {Circle} from './Circle';
import {toLatLng} from '../../geo/LatLng';
import * as Util from '../../core/Util';

/*
 * @class Ellipse
 * @aka L.Ellipse
 * @inherits Circle
 *
 * A class for drawing Ellipse overlays on a map. Extends `Circle`.
 *
 * It's an approximation and starts to diverge from a real Ellipse closer to poles (due to projection distortion).
 *
 * @example
 *
 * ```js
 * Ellipse([50.5, 30.5], {radius: 200}).addTo(map);
 * ```
 */

export var Ellipse = Circle.extend({
	initialize: function (latlng, options, legacyOptions) {

		if (typeof options === 'number') {
			// Backwards compatibility with 0.7.x factory (latlng, radius, options?)
			options = Util.extend({}, legacyOptions, {radius: options, radiusY: options});
		}
		Util.setOptions(this, options);
		this._latlng = toLatLng(latlng.lat, latlng.lng);

		if (isNaN(this.options.radius)) { throw new Error('Ellipse radius cannot be NaN'); }
		if (isNaN(this.options.radiusY)) { throw new Error('Ellipse radiusY cannot be NaN'); }

		this._mRadius = this.options.radius;
		this._mRadiusY = this.options.radiusY;
	},
	setRadiusY: function (radiusY) {
		this._mRadiusY = radiusY;
		return this.redraw();
	},
	getRadiusY: function () {
		return this._mRadiusY;
	},
	_project: function () {

		var map = this._map;
		var crs = map.options.crs;

		var latlngX = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));
		var latlngY = crs.unproject(crs.project(this._latlng).add([0, this._mRadiusY]));

		this._point = map.latLngToLayerPoint(this._latlng);
		this._radius = this._point.x - map.latLngToLayerPoint(latlngX).x;
		this._radiusY = this._point.y - map.latLngToLayerPoint(latlngY).y;

		this._updateBounds();
	}
});

// @factory Ellipse(latlng: LatLng, options?: Ellipse options)
// Instantiates a Ellipse object given a geographical point, and an options object
// which contains the Ellipse radius.
// @alternative
// @factory Ellipse(latlng: LatLng, radius: Number, options?: Ellipse options)
// Obsolete way of instantiating a Ellipse, for compatibility with 0.7.x code.
// Do not use in new applications or plugins.
export function ellipse(latlng, options, legacyOptions) {
	return new Ellipse(latlng, options, legacyOptions);
}
