/*
 * Copyright 2018 NEM
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
import { expect } from 'chai';
import { MosaicRepository } from '../../src/infrastructure/MosaicRepository';
import { Account } from '../../src/model/account/Account';
import { NetworkType } from '../../src/model/blockchain/NetworkType';
import { MosaicFlags } from '../../src/model/mosaic/MosaicFlags';
import { MosaicId } from '../../src/model/mosaic/MosaicId';
import { MosaicNonce } from '../../src/model/mosaic/MosaicNonce';
import { AliasAction } from '../../src/model/namespace/AliasAction';
import { NamespaceId } from '../../src/model/namespace/NamespaceId';
import { Deadline } from '../../src/model/transaction/Deadline';
import { MosaicAliasTransaction } from '../../src/model/transaction/MosaicAliasTransaction';
import { MosaicDefinitionTransaction } from '../../src/model/transaction/MosaicDefinitionTransaction';
import { NamespaceRegistrationTransaction } from '../../src/model/transaction/NamespaceRegistrationTransaction';
import { UInt64 } from '../../src/model/UInt64';
import { IntegrationTestHelper } from "./IntegrationTestHelper";
import { NamespaceRepository } from "../../src/infrastructure/NamespaceRepository";

describe('MosaicHttp', () => {

    let mosaicId: MosaicId;
    let mosaicRepository: MosaicRepository;
    let account: Account;
    let namespaceId: NamespaceId;
    let namespaceRepository: NamespaceRepository;
    let generationHash: string;
    let helper = new IntegrationTestHelper();
    let networkType: NetworkType;

    before(() => {
        return helper.start().then(() => {
            account = helper.account;
            generationHash = helper.generationHash;
            networkType = helper.networkType;
            namespaceRepository = helper.repositoryFactory.createNamespaceRepository();
            mosaicRepository = helper.repositoryFactory.createMosaicRepository();
        });
    });
    before(() => {
        return helper.listener.open();
    });

    after(() => {
        helper.listener.close();
    });
    afterEach((done) => {
        // cold down
        setTimeout(done, 200);
    });

    /**
     * =========================
     * Setup Test Data
     * =========================
     */
    describe('Setup test MosaicId', () => {

        it('Announce MosaicDefinitionTransaction', () => {
            const nonce = MosaicNonce.createRandom();
            mosaicId = MosaicId.createFromNonce(nonce, account.publicAccount);
            const mosaicDefinitionTransaction = MosaicDefinitionTransaction.create(
                Deadline.create(),
                nonce,
                mosaicId,
                MosaicFlags.create(true, true, false),
                3,
                UInt64.fromUint(0),
                networkType,
                helper.maxFee
            );
            const signedTransaction = mosaicDefinitionTransaction.signWith(account, generationHash);

            return helper.announce(signedTransaction);
        });
    });

    describe('Setup test NamespaceId', () => {

        it('Announce NamespaceRegistrationTransaction', () => {
            const namespaceName = 'root-test-namespace-' + Math.floor(Math.random() * 10000);
            const registerNamespaceTransaction = NamespaceRegistrationTransaction.createRootNamespace(
                Deadline.create(),
                namespaceName,
                UInt64.fromUint(1000),
                networkType,
                helper.maxFee
            );
            namespaceId = new NamespaceId(namespaceName);
            const signedTransaction = registerNamespaceTransaction.signWith(account, generationHash);

            return helper.announce(signedTransaction);
        });
    });
    describe('Setup test MosaicAlias', () => {

        it('Announce MosaicAliasTransaction', () => {
            const mosaicAliasTransaction = MosaicAliasTransaction.create(
                Deadline.create(),
                AliasAction.Link,
                namespaceId,
                mosaicId,
                networkType,
                helper.maxFee
            );
            const signedTransaction = mosaicAliasTransaction.signWith(account, generationHash);
            return helper.announce(signedTransaction);
        });
    });

    /**
     * =========================
     * Test
     * =========================
     */
    describe('getMosaic', () => {
        it('should return mosaic given mosaicId', (done) => {
            mosaicRepository.getMosaic(mosaicId)
            .subscribe((mosaicInfo) => {
                expect(mosaicInfo.height.lower).not.to.be.null;
                expect(mosaicInfo.divisibility).to.be.equal(3);
                expect(mosaicInfo.isSupplyMutable()).to.be.equal(true);
                expect(mosaicInfo.isTransferable()).to.be.equal(true);
                done();
            });
        });
    });

    describe('getMosaics', () => {
        it('should return mosaics given array of mosaicIds', (done) => {
            mosaicRepository.getMosaics([mosaicId])
            .subscribe((mosaicInfos) => {
                expect(mosaicInfos[0].height.lower).not.to.be.null;
                expect(mosaicInfos[0].divisibility).to.be.equal(3);
                expect(mosaicInfos[0].isSupplyMutable()).to.be.equal(true);
                expect(mosaicInfos[0].isTransferable()).to.be.equal(true);
                done();
            });
        });
    });

    describe('getMosaicsNames', () => {
        it('should call getMosaicsNames successfully', (done) => {
            namespaceRepository.getMosaicsNames([mosaicId]).subscribe((mosaicNames) => {
                expect(mosaicNames.length).to.be.greaterThan(0);
                done();
            });
        });
    });

    describe('getMosaicsFromAccount', () => {
        it('should call getMosaicsFromAccount successfully', (done) => {
            mosaicRepository.getMosaicsFromAccount(account.address).subscribe((mosaics) => {
                expect(mosaics.length).to.be.greaterThan(0);
                expect(mosaics.find((m) => m.id.toHex() === mosaicId.toHex()) !== undefined).to.be.true;
                done();
            });
        });
    });

    describe('getMosaicsFromAccounts', () => {
        it('should call getMosaicsFromAccounts successfully', (done) => {
            mosaicRepository.getMosaicsFromAccounts([account.address]).subscribe((mosaics) => {
                expect(mosaics.length).to.be.greaterThan(0);
                expect(mosaics.find((m) => m.id.toHex() === mosaicId.toHex()) !== undefined).to.be.true;
                done();
            });
        });
    });

    /**
     * =========================
     * House Keeping
     * =========================
     */
    describe('Remove test MosaicAlias', () => {


        it('Announce MosaicAliasTransaction', () => {
            const mosaicAliasTransaction = MosaicAliasTransaction.create(
                Deadline.create(),
                AliasAction.Unlink,
                namespaceId,
                mosaicId,
                networkType,
                helper.maxFee
            );
            const signedTransaction = mosaicAliasTransaction.signWith(account, generationHash);
            return helper.announce(signedTransaction);
        });
    });
});
