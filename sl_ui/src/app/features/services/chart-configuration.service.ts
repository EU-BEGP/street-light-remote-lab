// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartConfigurationService {

  /* Layouts */
  // Default layout
  private defaultLayout = {
    showlegend: false,
    autosize: true,
    height: 300,
    width: 600,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0,
    },
    scene: {
      camera: {
        eye: {
          x: 0,   // Camera is centered horizontally (x-axis is left to right)
          y: 2,   // Camera is positioned along the y-axis, looking into the screen
          z: 0.5, // Camera is slightly above the origin to see the z-axis vertically
        }
      },
      xaxis: {
        autorange: 'reversed',
        title: 'X Axis',
        showgrid: true,
        gridcolor: 'lightgray',
      },
      yaxis: {
        autorange: 'reversed',
        title: 'Y Axis',
        showgrid: true,
        gridcolor: 'lightgray',
      },
      zaxis: {
        title: 'Z Axis',
        gridcolor: 'lightgray',
        showgrid: true,
      },
    },
  };

  //Simulation Layout
  private simulationLayout = {
    showlegend: false,
    autosize: true,
    height: 400,
    width: 500,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0,
    },
    scene: {
      aspectratio: { x: 3, y: 1, z: 0.7 },
      aspectmode: 'manual',
      camera: {
        eye: {
          x: 1.5,
          y: 3,
          z: 0.5,
        }
      },
      xaxis: {
        autorange: 'reversed',
        title: 'X Axis',
        showgrid: true,
        gridcolor: 'lightgray',
      },
      yaxis: {
        autorange: 'reversed',
        title: 'Y Axis',
        showgrid: true,
        gridcolor: 'lightgray',
      },
      zaxis: {
        title: 'Z Axis',
        gridcolor: 'lightgray',
        showgrid: true,
      },
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

  /** Retrieves the simulation layout
   * @returns The simulation layout
   */
  getChartSimulationLayout(): any {
    return this.simulationLayout;
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
  getChartRestrictiveToolbarConfiguration(): any {
    return this.restrictiveToolbarConfiguration;
  }
}
