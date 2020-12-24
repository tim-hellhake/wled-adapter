/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

export interface Type {
  name: string;
  protocol: string;
}

export interface Txt {
  mac: string;
}

export interface Mac {
  type: string;
  data: number[];
}

export interface TxtRaw {
  mac: Mac;
}

export interface MdnsService {
  fullname: string;
  name: string;
  type: Type;
  domain: string;
  host: string;
  port: number;
  addresses: string[];
  txt: Txt;
  txtRaw: TxtRaw;
}
