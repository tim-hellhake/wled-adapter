/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import {Property} from 'gateway-addon';
import {WledDescription} from './wled';
import {WledDevice} from './wled-device';

export class LiveProperty extends Property<boolean> {

  // eslint-disable-next-line no-unused-vars
  constructor(private wledDevice: WledDevice) {
    super(wledDevice, 'live', {
      type: 'boolean',
      title: 'Live?',
      readOnly: true,
    });
  }

  async update(wledDescription: WledDescription): Promise<void> {
    const live = wledDescription.info.live;
    const oldLive = await this.getValue();
    if (live && !oldLive) {
      this.wledDevice.enterLiveMode();
    } else if (!live && oldLive) {
      this.wledDevice.leaveLiveMode();
    }
    this.setCachedValueAndNotify(live);
  }
}
