import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <!-- Line Chart -->
      @if (type === 'line') {
        <div class="line-chart">
          <svg [attr.width]="width" [attr.height]="height" class="chart-svg">
            <!-- Grid lines -->
            @for (line of gridLines(); track $index) {
              <line 
                [attr.x1]="0" 
                [attr.y1]="line.y" 
                [attr.x2]="width" 
                [attr.y2]="line.y" 
                class="grid-line"/>
            }
            
            <!-- Chart line -->
            <polyline 
              [attr.points]="linePoints()" 
              class="chart-line"
              [style.stroke]="color || 'var(--accent-gold)'"/>
            
            <!-- Data points -->
            @for (point of dataPoints(); track $index) {
              <circle 
                [attr.cx]="point.x" 
                [attr.cy]="point.y" 
                r="4" 
                class="data-point"
                [style.fill]="color || 'var(--accent-gold)'">
                <title>{{data.labels[$index]}}: {{data.values[$index]}}</title>
              </circle>
            }
          </svg>
          
          <!-- Labels -->
          <div class="chart-labels">
            @for (label of data.labels; track $index) {
              <span class="label">{{label}}</span>
            }
          </div>
        </div>
      }

      <!-- Bar Chart -->
      @if (type === 'bar') {
        <div class="bar-chart">
          @for (value of data.values; track $index) {
            <div class="bar-wrapper">
              <div 
                class="bar" 
                [style.height.%]="(value / maxValue()) * 100"
                [style.background]="data.colors?.[$index] || color || 'var(--gradient-accent)'">
                <span class="bar-value">&#36;{{ value | number:'1.2-2' }}</span>
              </div>
              <span class="bar-label">{{data.labels[$index]}}</span>
            </div>
          }
        </div>
      }

      <!-- Pie Chart -->
      @if (type === 'pie') {
        <div class="pie-chart">
          <svg [attr.width]="width" [attr.height]="height" [attr.viewBox]="'0 0 ' + width + ' ' + height">
            @for (slice of pieSlices(); track $index) {
              <path 
                [attr.d]="slice.path" 
                [style.fill]="data.colors?.[$index] || defaultColors[$index]"
                class="pie-slice">
                <title>{{data.labels[$index]}}: {{data.values[$index]}} ({{slice.percentage}}%)</title>
              </path>
            }
          </svg>
          <div class="pie-legend">
            @for (label of data.labels; track $index) {
              <div class="legend-item">
                <span 
                  class="legend-color" 
                  [style.background]="data.colors?.[$index] || defaultColors[$index]">
                </span>
                <span class="legend-label">{{label}}</span>
                <span class="legend-value">{{data.values[$index]}}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Donut Chart -->
      @if (type === 'donut') {
        <div class="donut-chart">
          <svg [attr.width]="width" [attr.height]="height" class="donut-svg">
            <circle 
              cx="50%" 
              cy="50%" 
              [attr.r]="(Math.min(width, height) / 2) - 20"
              class="donut-bg"/>
            @for (segment of donutSegments(); track $index) {
              <circle 
                cx="50%" 
                cy="50%" 
                [attr.r]="(Math.min(width, height) / 2) - 20"
                [attr.stroke-dasharray]="segment.dashArray"
                [attr.stroke-dashoffset]="segment.dashOffset"
                [style.stroke]="data.colors?.[$index] || defaultColors[$index]"
                class="donut-segment">
                <title>{{data.labels[$index]}}: {{data.values[$index]}}</title>
              </circle>
            }
          </svg>
          <div class="donut-center">
            <div class="donut-total">
              <span class="total-label">Total</span>
              <span class="total-value">&#36;{{ totalValue() | number }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-container {
      width: 100%;
      height: 100%;
      position: relative;
    }

    /* Line Chart */
    .line-chart {
      position: relative;
    }

    .chart-svg {
      width: 100%;
      display: block;
    }

    .grid-line {
      stroke: var(--border-color-light);
      stroke-width: 1;
    }

    .chart-line {
      fill: none;
      stroke-width: 3;
      filter: drop-shadow(0 0 8px currentColor);
    }

    .data-point {
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .data-point:hover {
      r: 6;
      filter: drop-shadow(0 0 10px currentColor);
    }

    .chart-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 0.5rem;
    }

    .label {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }

    /* Bar Chart */
    .bar-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 200px;
      gap: 0.5rem;
    }

    .bar-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .bar {
      width: 100%;
      border-radius: var(--radius-md) var(--radius-md) 0 0;
      transition: all var(--transition-base);
      position: relative;
      min-height: 20px;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 0.5rem;
    }

    .bar:hover {
      filter: brightness(1.2);
      transform: scaleY(1.05);
    }

    .bar-value {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--gray-900);
    }

    .bar-label {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      text-align: center;
    }

    /* Pie Chart */
    .pie-chart {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .pie-slice {
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .pie-slice:hover {
      opacity: 0.8;
      filter: brightness(1.2);
    }

    .pie-legend {
      flex: 1;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: var(--radius-sm);
    }

    .legend-label {
      flex: 1;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .legend-value {
      font-weight: 600;
      color: var(--text-primary);
    }

    /* Donut Chart */
    .donut-chart {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .donut-svg {
      display: block;
    }

    .donut-bg {
      fill: none;
      stroke: var(--gray-700);
      stroke-width: 30;
    }

    .donut-segment {
      fill: none;
      stroke-width: 30;
      transform: rotate(-90deg);
      transform-origin: center;
      transition: all var(--transition-base);
    }

    .donut-segment:hover {
      stroke-width: 35;
    }

    .donut-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .donut-total {
      text-align: center;
    }

    .total-label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }

    .total-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent-gold);
    }
  `]
})
export class ChartComponent implements OnInit {
  @Input() data!: ChartData;
  @Input() type: 'line' | 'bar' | 'pie' | 'donut' = 'line';
  @Input() width = 400;
  @Input() height = 200;
  @Input() color?: string;

  Math = Math;
  defaultColors = [
    'var(--accent-gold)',
    'var(--success)',
    'var(--info)',
    'var(--secondary-purple)',
    'var(--secondary-teal)',
    'var(--warning)'
  ];

  maxValue = signal(0);
  totalValue = signal(0);

  ngOnInit() {
    this.maxValue.set(Math.max(...this.data.values));
    this.totalValue.set(this.data.values.reduce((a, b) => a + b, 0));
  }

  gridLines() {
    const lines = [];
    const step = this.height / 5;
    for (let i = 0; i <= 5; i++) {
      lines.push({ y: i * step });
    }
    return lines;
  }

  dataPoints() {
    const max = this.maxValue();
    const stepX = this.width / (this.data.values.length - 1 || 1);
    
    return this.data.values.map((value, index) => ({
      x: index * stepX,
      y: this.height - (value / max * this.height)
    }));
  }

  linePoints() {
    return this.dataPoints().map(p => `${p.x},${p.y}`).join(' ');
  }

  pieSlices() {
    const total = this.totalValue();
    let currentAngle = 0;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(this.width, this.height) / 2 - 10;

    return this.data.values.map(value => {
      const percentage = (value / total) * 100;
      const angle = (value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
      const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
      const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
      const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
      
      const largeArc = angle > 180 ? 1 : 0;
      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      
      currentAngle += angle;
      
      return { path, percentage: percentage.toFixed(1) };
    });
  }

  donutSegments() {
    const total = this.totalValue();
    const circumference = 2 * Math.PI * ((Math.min(this.width, this.height) / 2) - 20);
    let offset = 0;

    return this.data.values.map(value => {
      const percentage = value / total;
      const dashArray = `${percentage * circumference} ${circumference}`;
      const dashOffset = -offset * circumference;
      offset += percentage;
      
      return { dashArray, dashOffset };
    });
  }
}
