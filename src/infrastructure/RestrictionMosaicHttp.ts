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

import { Observable } from 'rxjs';
import {
    MosaicAddressRestrictionDTO,
    MosaicAddressRestrictionEntryDTO,
    MosaicGlobalRestrictionDTO,
    MosaicGlobalRestrictionEntryDTO,
    RestrictionMosaicRoutesApi,
} from 'symbol-openapi-typescript-fetch-client';
import { DtoMapping } from '../core/utils/DtoMapping';
import { UInt64 } from '../model';
import { Address } from '../model/account/Address';
import { MosaicId } from '../model/mosaic/MosaicId';
import { MosaicAddressRestriction } from '../model/restriction/MosaicAddressRestriction';
import { MosaicAddressRestrictionItem } from '../model/restriction/MosaicAddressRestrictionItem';
import { MosaicGlobalRestriction } from '../model/restriction/MosaicGlobalRestriction';
import { MosaicGlobalRestrictionItem } from '../model/restriction/MosaicGlobalRestrictionItem';
import { Http } from './Http';
import { Page } from './Page';
import { RestrictionMosaicRepository } from './RestrictionMosaicRepository';
import { RestrictionMosaicSearchCriteria } from './searchCriteria/RestrictionMosaicSearchCriteria';

/**
 * RestrictionMosaic http repository.
 *
 * @since 1.0
 */
export class RestrictionMosaicHttp extends Http implements RestrictionMosaicRepository {
    /**
     * @internal
     */
    private restrictionMosaicRoutesApi: RestrictionMosaicRoutesApi;

    /**
     * Constructor
     * @param url Base catapult-rest url
     * @param fetchApi fetch function to be used when performing rest requests.
     */
    constructor(url: string, fetchApi?: any) {
        super(url, fetchApi);
        this.restrictionMosaicRoutesApi = new RestrictionMosaicRoutesApi(this.config());
    }

    /**
     * Returns a mosaic restrictions page based on the criteria.
     *
     * @param criteria the criteria
     * @return a page of {@link MosaicAddressRestriction | MosaicGlobalRestriction}
     */
    public searchMosaicRestrictions(
        criteria: RestrictionMosaicSearchCriteria,
    ): Observable<Page<MosaicAddressRestriction | MosaicGlobalRestriction>> {
        return this.call(
            this.restrictionMosaicRoutesApi.searchMosaicRestriction(
                criteria.mosaicId?.toHex(),
                criteria.entryType?.valueOf(),
                criteria.targetAddress?.plain(),
                criteria.pageSize,
                criteria.pageNumber,
                criteria.offset,
                DtoMapping.mapEnum(criteria.order),
            ),
            (body) => super.toPage(body.pagination, body.data, (r) => this.toMosaicRestriction(r)),
        );
    }

    /**
     * This method maps a mosaic restriction dto from rest to the SDK's model object.
     *
     * @internal
     * @param {MosaicAddressRestrictionDTO | MosaicGlobalRestrictionDTO} dto the restriction object from rest.
     * @returns {MosaicAddressRestriction | MosaicGlobalRestriction} a restriction model
     */
    private toMosaicRestriction(
        dto: MosaicAddressRestrictionDTO | MosaicGlobalRestrictionDTO,
    ): MosaicAddressRestriction | MosaicGlobalRestriction {
        if ((dto.mosaicRestrictionEntry as any).targetAddress) {
            const addressRestrictionDto = dto as MosaicAddressRestrictionDTO;
            return new MosaicAddressRestriction(
                dto.mosaicRestrictionEntry.compositeHash,
                dto.mosaicRestrictionEntry.entryType.valueOf(),
                new MosaicId(dto.mosaicRestrictionEntry.mosaicId),
                Address.createFromEncoded(addressRestrictionDto.mosaicRestrictionEntry.targetAddress),
                addressRestrictionDto.mosaicRestrictionEntry.restrictions.map(this.toMosaicAddressRestrictionItem),
            );
        }

        const globalRestrictionDto = dto as MosaicGlobalRestrictionDTO;
        return new MosaicGlobalRestriction(
            dto.mosaicRestrictionEntry.compositeHash,
            dto.mosaicRestrictionEntry.entryType.valueOf(),
            new MosaicId(dto.mosaicRestrictionEntry.mosaicId),
            globalRestrictionDto.mosaicRestrictionEntry.restrictions.map((i) => this.toMosaicGlobalRestrictionItem(i)),
        );
    }

    private toMosaicGlobalRestrictionItem(restriction: MosaicGlobalRestrictionEntryDTO): MosaicGlobalRestrictionItem {
        return new MosaicGlobalRestrictionItem(
            UInt64.fromNumericString(restriction.key),
            new MosaicId(restriction.restriction.referenceMosaicId),
            UInt64.fromNumericString(restriction.restriction.restrictionValue),
            restriction.restriction.restrictionType.valueOf(),
        );
    }

    private toMosaicAddressRestrictionItem(restriction: MosaicAddressRestrictionEntryDTO): MosaicAddressRestrictionItem {
        return new MosaicAddressRestrictionItem(UInt64.fromNumericString(restriction.key), UInt64.fromNumericString(restriction.value));
    }
}
