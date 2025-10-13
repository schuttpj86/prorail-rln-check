/**
 * Layer Factory
 * 
 * Creates ArcGIS FeatureLayer or MapImageLayer instances from configuration objects.
 * Handles the conversion between our config format and ArcGIS API format.
 */

import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";

/**
 * Create a FeatureLayer from a configuration object
 * 
 * @param {Object} config - Layer configuration from layerConfig.js
 * @returns {FeatureLayer} - ArcGIS FeatureLayer instance
 */
export function createFeatureLayer(config) {
  const layerOptions = {
    url: config.url,
    title: config.title,
    visible: config.visible !== undefined ? config.visible : true,
    listMode: 'show',
    popupEnabled: true,
    outFields: config.outFields || ['*']
  };

  // Add scale range if specified
  if (config.minScale !== undefined) {
    layerOptions.minScale = config.minScale;
  }
  if (config.maxScale !== undefined) {
    layerOptions.maxScale = config.maxScale;
  }

  // Add renderer if specified
  if (config.renderer) {
    layerOptions.renderer = config.renderer;
  }

  // Add popup template if specified
  if (config.popupTemplate) {
    layerOptions.popupTemplate = config.popupTemplate;
  }

  // Add custom properties for identification
  layerOptions.customId = config.id;
  layerOptions.description = config.description;

  return new FeatureLayer(layerOptions);
}

/**
 * Create a MapImageLayer from a configuration object
 * Use this for FeatureServers that have multiple sublayers
 * 
 * @param {Object} config - Layer configuration from layerConfig.js
 * @returns {MapImageLayer} - ArcGIS MapImageLayer instance
 */
export function createMapImageLayer(config) {
  const layerOptions = {
    url: config.url,
    title: config.title,
    visible: config.visible !== undefined ? config.visible : true,
    listMode: 'show'
  };

  // Add scale range if specified
  if (config.minScale !== undefined) {
    layerOptions.minScale = config.minScale;
  }
  if (config.maxScale !== undefined) {
    layerOptions.maxScale = config.maxScale;
  }

  // Add sublayer visibility configuration if specified
  if (config.sublayers) {
    layerOptions.sublayers = config.sublayers;
  }

  // Add custom properties for identification
  layerOptions.customId = config.id;
  layerOptions.description = config.description;

  return new MapImageLayer(layerOptions);
}

/**
 * Create multiple FeatureLayers from an array of configurations
 * 
 * @param {Array} configs - Array of layer configurations
 * @returns {Array<FeatureLayer>} - Array of ArcGIS FeatureLayer instances
 */
export function createFeatureLayers(configs) {
  return configs
    .filter(config => config.url) // Only create layers with valid URLs
    .map(config => createFeatureLayer(config));
}

/**
 * Create multiple MapImageLayers from an array of configurations
 * 
 * @param {Array} configs - Array of layer configurations
 * @returns {Array<MapImageLayer>} - Array of ArcGIS MapImageLayer instances
 */
export function createMapImageLayers(configs) {
  return configs
    .filter(config => config.url) // Only create layers with valid URLs
    .map(config => createMapImageLayer(config));
}

/**
 * Create layers with error handling and logging
 * Automatically chooses between FeatureLayer and MapImageLayer based on config
 * 
 * @param {Array} configs - Array of layer configurations
 * @param {Function} onSuccess - Callback when layer loads successfully
 * @param {Function} onError - Callback when layer fails to load
 * @returns {Array} - Array of ArcGIS Layer instances (FeatureLayer or MapImageLayer)
 */
export function createFeatureLayersWithHandling(configs, onSuccess, onError) {
  return configs
    .filter(config => config.url)
    .map(config => {
      // Choose layer type based on configuration
      const layer = config.layerType === 'map-image' 
        ? createMapImageLayer(config)
        : createFeatureLayer(config);
      
      // Add load handlers
      layer.when(() => {
        const layerTypeStr = config.layerType === 'map-image' ? 'MapImageLayer' : 'FeatureLayer';
        console.log(`✅ ${layerTypeStr} loaded: ${layer.title}`);
        
        // Log sublayer count for MapImageLayers
        if (config.layerType === 'map-image' && layer.allSublayers) {
          console.log(`   📊 Sublayers: ${layer.allSublayers.length}`);

          layer.allSublayers.forEach(sublayer => {
            sublayer.listMode = config.listSublayers === false ? 'hide' : 'show';
            sublayer.legendEnabled = true;

            if (Array.isArray(config.visibleSublayers)) {
              sublayer.visible = config.visibleSublayers.includes(sublayer.id);
            }

            if (config.defaultSublayerVisibilities && typeof config.defaultSublayerVisibilities === 'object') {
              if (config.defaultSublayerVisibilities.hasOwnProperty(sublayer.id)) {
                sublayer.visible = !!config.defaultSublayerVisibilities[sublayer.id];
              }
            }
          });
        }
        
        if (onSuccess) {
          onSuccess(layer, config);
        }
      }).catch(error => {
        console.error(`❌ Layer failed: ${layer.title}`, error);
        if (onError) {
          onError(layer, config, error);
        }
      });
      
      return layer;
    });
}

/**
 * Create MapImageLayers with error handling and logging
 * 
 * @param {Array} configs - Array of layer configurations
 * @param {Function} onSuccess - Callback when layer loads successfully
 * @param {Function} onError - Callback when layer fails to load
 * @returns {Array<MapImageLayer>} - Array of ArcGIS MapImageLayer instances
 */
export function createMapImageLayersWithHandling(configs, onSuccess, onError) {
  return configs
    .filter(config => config.url)
    .map(config => {
      const layer = createMapImageLayer(config);
      
      // Add load handlers
      layer.when(() => {
        console.log(`✅ MapImageLayer loaded: ${layer.title} (${layer.allSublayers?.length || 0} sublayers)`);
        if (onSuccess) {
          onSuccess(layer, config);
        }
      }).catch(error => {
        console.error(`❌ MapImageLayer failed: ${layer.title}`, error);
        if (onError) {
          onError(layer, config, error);
        }
      });
      
      return layer;
    });
}
