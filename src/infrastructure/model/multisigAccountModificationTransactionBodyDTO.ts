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


export class MultisigAccountModificationTransactionBodyDTO {
    /**
    * Number of signatures needed to remove a cosignatory. If we are modifying an existing multisig account, this indicates the relative change of the minimum cosignatories. 
    */
    'minRemovalDelta': number;
    /**
    * Number of signatures needed to approve a transaction. If we are modifying an existing multisig account, this indicates the relative change of the minimum cosignatories. 
    */
    'minApprovalDelta': number;
    /**
    * Array of cosignatory accounts to add.
    */
    'publicKeyAdditions': Array<string>;
    /**
    * Array of cosignatory accounts to delete.
    */
    'publicKeyDeletions': Array<string>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "minRemovalDelta",
            "baseName": "minRemovalDelta",
            "type": "number"
        },
        {
            "name": "minApprovalDelta",
            "baseName": "minApprovalDelta",
            "type": "number"
        },
        {
            "name": "publicKeyAdditions",
            "baseName": "publicKeyAdditions",
            "type": "Array<string>"
        },
        {
            "name": "publicKeyDeletions",
            "baseName": "publicKeyDeletions",
            "type": "Array<string>"
        }    ];

    static getAttributeTypeMap() {
        return MultisigAccountModificationTransactionBodyDTO.attributeTypeMap;
    }
}

