import { LabinsightViewerProvider } from './provider';

export function refreshView(provider: LabinsightViewerProvider) {
  provider.refresh();
}