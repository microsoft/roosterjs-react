import { initializeIcons as i } from './fabric-icons';

import { IIconOptions } from 'office-ui-fabric-react/lib/Styling';
import { registerIconAliases } from './iconAliases';
const DEFAULT_BASE_URL = '/sample/fabric/fonts/';

export function initializeIcons(
  baseUrl: string = DEFAULT_BASE_URL,
  options?: IIconOptions
): void {
  [i].forEach(
    (initialize: (url: string, options?: IIconOptions) => void) => initialize(baseUrl, options)
  );

  registerIconAliases();
}

export { IconNames } from './IconNames';
