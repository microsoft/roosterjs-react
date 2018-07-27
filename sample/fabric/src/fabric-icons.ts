  // Your use of the content in the files referenced here is subject to the terms of the license at https://aka.ms/fabric-assets-license

// tslint:disable:max-line-length

import {
  IIconOptions,
  IIconSubset,
  registerIcons
} from '@uifabric/styling';

export function initializeIcons(
  baseUrl: string = '',
  options?: IIconOptions
): void {
  const subset: IIconSubset = {
    style: {
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontStyle: 'normal',
      fontWeight: 'normal',
      speak: 'none'
    },
    fontFace: {
      fontFamily: 'FabricMDL2Icons',
      src: `url('${baseUrl}fabric-icons.woff') format('woff')`
    },
    icons: {
      'ChevronDown': '\uE70D',
      'More': '\uE712',
      'Link': '\uE71B',
      'CheckMark': '\uE73E',
      'Redo': '\uE7A6',
      'Undo': '\uE7A7',
      'FontColor': '\uE8D3',
      'Italic': '\uE8DB',
      'Underline': '\uE8DC',
      'Bold': '\uE8DD',
      'FontSize': '\uE8E9',
      'BulletedList': '\uE8FD',
      'CheckList': '\uE9D5',
      'NumberedList': '\uEA1C',
      'Photo2': '\uEB9F',
      'Embed': '\uECCE',
      'RemoveLink': '\uED90',
      'ClearFormatting': '\uEDDD',
      'Strikethrough': '\uEDE0',
      'Vacation': '\uF49F',
      'FontColorA': '\uF4EC',
      'FontColorSwatch': '\uF4ED',
      'BulletedListText': '\uF792',
      'BulletedListBullet': '\uF793',
      'NumberedListText': '\uF796',
      'NumberedListNumber': '\uF797',
      'RemoveLinkChain': '\uF79A',
      'RemoveLinkX': '\uF79B',
      'FabricTextHighlight': '\uF79C',
      'ClearFormattingA': '\uF79D',
      'ClearFormattingEraser': '\uF79E',
      'Photo2Fill': '\uF79F',
      'IncreaseIndentText': '\uF7A0',
      'IncreaseIndentArrow': '\uF7A1',
      'DecreaseIndentText': '\uF7A2',
      'DecreaseIndentArrow': '\uF7A3',
      'CheckListText': '\uF7A8',
      'CheckListCheck': '\uF7A9',
      'DecreaseIndentLegacy': '\uE290',
      'IncreaseIndentLegacy': '\uE291'
    }
  };

  registerIcons(subset, options);
}
