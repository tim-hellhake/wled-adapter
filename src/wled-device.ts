/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import {Adapter, Device} from 'gateway-addon';
import fetch from 'node-fetch';
import {BrightnessProperty} from './brightness-property';
import {ColorProperty} from './color-property';
import {OnOffProperty} from './on-off-property';
import {LiveProperty} from './live-property';
import {TimerProperty} from './timer-property';
import {SyncProperty} from './sync-property';
import {EffectProperty} from './effect-property';
import {PaletteProperty} from './palette-property';
import {EffectSpeedProperty} from './effect-speed-property';
import {EffectIntensityProperty} from './effect-intensity-property';
import {WledDescription} from './wled';

export class WledDevice extends Device {
  private onOffProperty: OnOffProperty;

  private brightnessProperty: BrightnessProperty;

  private colorProperty: ColorProperty;

  private liveProperty: LiveProperty;

  private timerProperty: TimerProperty;

  private syncProperty: SyncProperty;

  private effectProperty: EffectProperty;

  private paletteProperty: PaletteProperty;

  private effectSpeedProperty: EffectSpeedProperty;

  private effectIntensityProperty: EffectIntensityProperty;

  private connected?: boolean;

  private intervalMs: number;

  constructor(
    adapter: Adapter,
    id: string,
    private url: string,
    wledDescription: WledDescription) {
    super(adapter, id);
    this['@context'] = 'https://iot.mozilla.org/schemas/';
    this['@type'] = ['Light'];
    this.setTitle(wledDescription.info.name);

    this.onOffProperty = new OnOffProperty(this, url);
    this.addProperty(this.onOffProperty);
    this.brightnessProperty = new BrightnessProperty(this, url);
    this.addProperty(this.brightnessProperty);
    this.colorProperty = new ColorProperty(this, url);
    this.addProperty(this.colorProperty);
    this.liveProperty = new LiveProperty(this);
    this.addProperty(this.liveProperty);
    this.timerProperty = new TimerProperty(this, url);
    this.addProperty(this.timerProperty);
    this.syncProperty = new SyncProperty(this, url);
    this.addProperty(this.syncProperty);
    this.effectProperty = new EffectProperty(
      this, url, wledDescription.effects
    );
    this.addProperty(this.effectProperty);
    this.paletteProperty = new PaletteProperty(
      this, url, wledDescription.palettes
    );
    this.addProperty(this.paletteProperty);
    this.effectSpeedProperty = new EffectSpeedProperty(this, url);
    this.addProperty(this.effectSpeedProperty);
    this.effectIntensityProperty = new EffectIntensityProperty(this, url);
    this.addProperty(this.effectIntensityProperty);
    // eslint-disable-next-line no-undefined
    this.connected = undefined;
    this.intervalMs = 1000;
  }

  public startPolling(intervalMs: number): void {
    this.connectedNotify(true);
    this.intervalMs = intervalMs;
    setTimeout(() => this.poll(), intervalMs);
  }

  public connectedNotify(state: boolean): void {
    super.connectedNotify(state);
    this.connected = state;
  }

  public enterLiveMode(): void {
    this.brightnessProperty.setReadOnly(true);
    this.colorProperty.setReadOnly(true);
    this.timerProperty.setReadOnly(true);
    this.syncProperty.setReadOnly(true);
    this.effectProperty.setReadOnly(true);
    this.paletteProperty.setReadOnly(true);
    this.effectSpeedProperty.setReadOnly(true);
    this.effectIntensityProperty.setReadOnly(true);
    this.getAdapter().handleDeviceAdded(this);
  }

  public leaveLiveMode(): void {
    this.brightnessProperty.setReadOnly(false);
    this.colorProperty.setReadOnly(false);
    this.timerProperty.setReadOnly(false);
    this.syncProperty.setReadOnly(false);
    this.effectProperty.setReadOnly(false);
    this.paletteProperty.setReadOnly(false);
    this.effectSpeedProperty.setReadOnly(false);
    this.effectIntensityProperty.setReadOnly(false);
    this.getAdapter().handleDeviceAdded(this);
  }

  async poll(): Promise<void> {
    let json: WledDescription;

    try {
      const response = await fetch(this.url);
      json = await response.json();

      if (json === null) {
        setTimeout(() => this.poll(), this.intervalMs);
        return;
      }

      if (this.connected === false) {
        console.error('Reconnected');
        this.connectedNotify(true);
      }

      this.onOffProperty.update(json);
      this.brightnessProperty.update(json);
      this.colorProperty.update(json);
      this.liveProperty.update(json);
      this.timerProperty.update(json);
      this.syncProperty.update(json);
      this.effectProperty.update(json);
      this.paletteProperty.update(json);
      this.effectSpeedProperty.update(json);
      this.effectIntensityProperty.update(json);
    } catch (ex) {
      if (this.connected === true) {
        console.error('Communication error: ', ex, '\nI will keep retrying!');
        this.connectedNotify(false);
      }
    }

    setTimeout(() => this.poll(), this.intervalMs);
  }
}
