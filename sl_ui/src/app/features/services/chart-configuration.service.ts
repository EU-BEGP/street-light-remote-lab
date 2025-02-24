import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartConfigurationService {

  /* Layouts */
  // Default layout
  private defaultLayout = {
    autosize: true,
    height: 300,
    width: 300,
    showlegend: false,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0,
    }, // No margins
    scene: {
      camera: {
        eye: {
          x: 1.5,
          y: 1.5,
          z: 1.5,
        },
      }, // Camera position for better view
    },
  };

  // Restrictive layout for simulations
  private restrictiveLayout = {
    ...this.defaultLayout, // Inherit properties from the initial layout
    hovermode: false, // Disable hover interactions
    dragmode: false, // Disable dragging
    // Additional options to make it more static
    xaxis: {
      fixedrange: true, // Disable zooming on x-axis
    },
    yaxis: {
      fixedrange: true, // Disable zooming on y-axis
    },
  };

  /* Configurations */
  // Restrictive configuration for the mode bar (toolbar)
  private restrictiveToolbarConfiguration = {
    displayModeBar: true,
    modeBarButtonsToRemove: [
      // 2D buttons
      'zoom2d',
      'pan2d',
      'select2d',
      'lasso2d',
      'zoomIn2d',
      'zoomOut2d',
      'autoScale2d',
      'resetScale2d',
      // 3D buttons
      'zoom3d',
      'pan3d',
      'orbitRotation',
      'tableRotation',
      'handleDrag3d',
      'resetCameraDefault3d',
      'resetCameraLastSave3d',
      'hoverClosest3d',
      // Cartesian buttons
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      // Geo buttons
      'zoomInGeo',
      'zoomOutGeo',
      'resetGeo',
      'hoverClosestGeo',
      // Other buttons
      'hoverClosestGl2d',
      'hoverClosestPie',
      'toggleHover',
      'resetViews',
      'sendDataToCloud',
      'toggleSpikelines',
      'resetViewMapbox',
    ],
  }

  constructor() { }

  /** Retrieves the default layout
   * @returns The default layout
   */
  getChartDefaultLayout(): any {
    return this.defaultLayout;
  }

  /** Retrieves the restrictive layout
   * @returns The restrictive layout.
   */
  getChartRestrictiveLayout(): any {
    return this.restrictiveLayout;
  }

  /** Retrieves the restrictive toolbar configuration
   * @returns The restrictive toolbar configuration.
   */
  getChartRestrictiveToolabarConfiguration(): any {
    return this.restrictiveToolbarConfiguration;
  }
}
