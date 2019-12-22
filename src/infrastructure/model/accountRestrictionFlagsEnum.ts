/*
 * Copyright 2019 NEM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Catapult REST Endpoints
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.7.20.6
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * Type of account restriction:
 * 0x0001 (1 decimal) - Allow only incoming transactions from a given address.
 * 0x0002 (2 decimal) - Allow only incoming transactions containing a given mosaic identifier.
 * 0x4001 (16385 decimal) - Allow only outgoing transactions to a given address.
 * 0x4004 (16388 decimal) - Allow only outgoing transactions with a given transaction type.
 * 0x8001 (32769 decimal) - Block incoming transactions from a given address.
 * 0x8002 (32770 decimal) - Block incoming transactions containing a given mosaic identifier.
 * 0xC001 (49153 decimal) - Block outgoing transactions to a given address.
 * 0xC004 (49156 decimal) - Block outgoing transactions with a given transaction type.
 */
export enum AccountRestrictionFlagsEnum {
    NUMBER_1 =  1,
    NUMBER_2 =  2,
    NUMBER_16385 =  16385,
    NUMBER_16388 =  16388,
    NUMBER_32769 =  32769,
    NUMBER_32770 =  32770,
    NUMBER_49153 =  49153,
    NUMBER_49156 =  49156,
}
