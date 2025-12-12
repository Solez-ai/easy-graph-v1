export interface ChartDataStructure {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
    [key: string]: any;
  }[];
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'scatter' | 'bubble';
  data: ChartDataStructure;
  options: any;
}

export interface ExtractedData {
  [key: string]: any;
}

export interface GenAIResponse {
  chartConfig: ChartConfiguration;
  extractedData: ExtractedData;
  userRequest: string;
  summary: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: {
    type: 'image' | 'file';
    url?: string;
    name: string;
    data?: string; // Base64 string for persistence
  }[];
  chartConfig?: ChartConfiguration;
  extractedData?: ExtractedData;
}

export interface Project {
  id: string;
  name: string;
  messages: Message[];
  chartConfig: ChartConfiguration | null;
  lastModified: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  EDITOR = 'EDITOR',
}