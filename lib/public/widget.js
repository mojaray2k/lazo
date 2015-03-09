define(['base', 'uiStateMixin', 'underscore'], function (Base, uiStateMixin, _) {

    'use strict';

    return Base.extend(_.extend({

        constructor: function (options) {
            this.view = options.view;
            this._setAttributes(_.omit(options, 'view'));
            Base.call(this, {});
            this.initialize.apply(this);
        },

        attrValCoercion: true,

        initialize: function () {},

        render: function (options) {
            options.success('');
        },

        afterRender: function (options) {
            options.success();
        },

        bind: function (el) {},

        unbind: function (el) {},

        _setAttributes: function (attributes) {
            if (this.attrValCoercion) {
                attributes = this._coerce(attributes);
            }

            this.attributes = this.attributes || {};
            this.attributes = _.extend(this.attributes, _.omit(this._resolveAttributes(attributes), 'view'));
        },

        // coerce values, e.g, '["foo", "bar"]' to an array
        _coerce: function (attributes) {
            var val;

            for (var k in attributes) {
                val = attributes[k];
                if (val.charAt(0) === '[' || val.charAt(0) === '{') {
                    try {
                        attributes[k] = JSON.parse(val);
                    } catch (e) {
                        LAZO.logger.warn('[lazoWidget] Error while parsing attribute value', e);
                    }
                } else if (_.isNumber(parseFloat(val)) && !_.isNaN(parseFloat(val))) {
                    attributes[k] = parseFloat(val);
                } else if (val === 'true') {
                    attributes[k] = true;
                } else if (val === 'false') {
                    attributes[k] = false;
                }
            }

            return attributes;
        },

        // map $.* values to context properties
        _resolveAttributes: function (attributes) {
            var self = this;
            var retVal = {};
            var ctxMappings = {};
             _.each(attributes, function (attribute, k) {
                var isCtxMapping = _.isString(attribute) && !attribute.indexOf('$');
                if (isCtxMapping) {
                    ctxMappings[k] = attribute;
                } else {
                    retVal[k] = attribute;
                }

                return isCtxMapping;
            });

            _.each(ctxMappings, function (val, k) {
                self._resolveCtxVal(retVal, val, k);
            });

            return retVal;
        },

        _resolveCtxVal: function (attrCtx, val, key) {
            var keys = val.split('.').slice(1);
            var ctx = this.view.ctl.ctx;
            var struct;
            var retVal;

            for (var i = 0; i < keys.length; i++) {
                attrCtx[key] = ctx[keys[i]];
                if (!attrCtx) {
                    break;
                }
            }

            return attrCtx;
        }

    }, uiStateMixin));

});