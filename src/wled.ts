/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

export interface WledDescription {
  state: State;
  info: Info;
  effects: [string],
  palettes: [string],
}

export interface State {
  on: boolean;
  bri: number;
  transition: number;
  ps: number;
  pss: number;
  pl: number;
  ccnf: Ccnf;
  nl: Nl;
  udpn: Udpn;
  lor: number;
  mainseg: number;
  seg: Seg[];
}

export interface Ccnf {
  min: number;
  max: number;
  time: number;
}

export interface Nl {
  on: boolean;
  dur: number;
  fade: boolean;
  mode: number;
  tbri: number;
}

export interface Udpn {
  send: boolean;
  recv: boolean;
}

export interface Seg {
  id: number;
  start: number;
  stop: number;
  len: number;
  grp: number;
  spc: number;
  on: boolean;
  bri: number;
  col: number[][];
  fx: number;
  sx: number;
  ix: number;
  pal: number;
  sel: boolean;
  rev: boolean;
  mi: boolean;
}

export interface Info {
  ver: string;
  vid: number;
  leds: Leds;
  str: boolean;
  name: string;
  udpport: number;
  live: boolean;
  lm: string;
  lip: string;
  ws: number;
  fxcount: number;
  palcount: number;
  wifi: Wifi;
  arch: string;
  core: string;
  lwip: number;
  freeheap: number;
  uptime: number;
  opt: number;
  brand: string;
  product: string;
  mac: string;
}

export interface Leds {
  count: number;
  rgbw: boolean;
  wv: boolean;
  pin: number[];
  pwr: number;
  maxpwr: number;
  maxseg: number;
  seglock: boolean;
}

export interface Wifi {
  bssid: string;
  rssi: number;
  signal: number;
  channel: number;
}
