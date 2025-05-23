// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-light-intensity-distribution-dialog',
  templateUrl: './light-intensity-distribution-dialog.component.html',
  styleUrls: ['./light-intensity-distribution-dialog.component.css']
})
export class LightIntensityDistributionDialogComponent {
  selectedChart: 'histogram' | 'polar' | 'threshold' = 'histogram';

  chartData = {
    histogram: {
      title: 'Intensity Distribution Analysis',
      description: 'This histogram displays the frequency distribution of intensity values across all grid cells in your 8×8 matrix.',
      purpose: [
        'Understand the spread of intensity measurements',
        'Identify common intensity ranges',
        'Detect unusual patterns or outliers'
      ],
      readingTips: [
        'X-axis shows intensity ranges (binned values)',
        'Y-axis shows count of grid cells in each range',
        'Peaks indicate common intensity values',
        'Gaps may indicate measurement thresholds'
      ],
      questions: [
        'Where do most intensity values cluster?',
        'Are there any unusually high or low values?',
        'How would you describe the overall distribution shape?'
      ]
    },
    polar: {
      title: 'Spatial Distribution Analysis',
      description: 'This polar plot reveals how intensity values are distributed relative to the center of your grid.',
      purpose: [
        'Analyze directional patterns in your data',
        'Compare intensity distribution across different angles',
        'Identify asymmetries in your measurements'
      ],
      readingTips: [
        'Distance from center represents intensity value',
        'Angle indicates direction from grid center',
        'Concentric circles mark intensity intervals',
        'Symmetrical patterns suggest uniform distribution'
      ],
      questions: [
        'Are intensities evenly distributed in all directions?',
        'Where are the highest intensity values located?',
        'What might cause clusters in specific directions?'
      ]
    },
    threshold: {
      title: 'Threshold Coverage Analysis',
      description: 'This curve shows how the percentage of qualifying grid cells changes with different intensity thresholds.',
      purpose: [
        'Determine optimal intensity cutoffs',
        'Quantify coverage at different sensitivity levels',
        'Understand the trade-off between quality and quantity'
      ],
      readingTips: [
        'X-axis shows minimum intensity threshold',
        'Y-axis shows percentage of cells above threshold',
        'Steeper slopes indicate fewer cells in that range',
        'Plateaus suggest common intensity levels'
      ],
      questions: [
        'How does coverage change between thresholds X and Y?',
        'What threshold would you choose for critical applications?'
      ]
    }
  };

  constructor(public dialogRef: MatDialogRef<LightIntensityDistributionDialogComponent>) { }

  get currentChart() {
    return this.chartData[this.selectedChart];
  }
}
