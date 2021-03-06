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
import { Account } from '../../src/model/account/Account';
import { NetworkType } from '../../src/model/network/NetworkType';
import { Deadline } from '../../src/model/transaction/Deadline';
import { UInt64 } from '../../src/model/UInt64';
import { IntegrationTestHelper } from './IntegrationTestHelper';
import { toArray, take } from 'rxjs/operators';
import { deepEqual } from 'assert';
import { Order, SecretLockPaginationStreamer } from '../../src/infrastructure/infrastructure';
import { SecretLockRepository } from '../../src/infrastructure/SecretLockRepository';
import { SecretLockTransaction } from '../../src/model/transaction/SecretLockTransaction';
import { LockHashAlgorithm } from '../../src/model/lock/LockHashAlgorithm';
import { sha3_256 } from 'js-sha3';
import { Crypto } from '../../src/core/crypto';

describe('SecretLockHttp', () => {
    const helper = new IntegrationTestHelper();
    let account: Account;
    let account2: Account;
    let SecretLockRepo: SecretLockRepository;
    let generationHash: string;
    let networkType: NetworkType;
    let secret: string;

    before(() => {
        return helper.start({ openListener: true }).then(() => {
            account = helper.account;
            account2 = helper.account2;
            networkType = helper.networkType;
            generationHash = helper.generationHash;
            SecretLockRepo = helper.repositoryFactory.createSecretLockRepository();
            secret = sha3_256.create().update(Crypto.randomBytes(20)).hex();
        });
    });

    after(() => {
        return helper.close();
    });

    /**
     * =========================
     * Setup test data
     * =========================
     */

    describe('Create a hash lock', () => {
        it('Announce SecretLockTransaction', () => {
            const secretLockTransaction = SecretLockTransaction.create(
                Deadline.create(helper.epochAdjustment),
                helper.createNetworkCurrency(10, false),
                UInt64.fromUint(100),
                LockHashAlgorithm.Op_Sha3_256,
                secret,
                account2.address,
                networkType,
                helper.maxFee,
            );
            const signedTransaction = secretLockTransaction.signWith(account, generationHash);
            return helper.announce(signedTransaction);
        });
    });

    /**
     * =========================
     * Tests
     * =========================
     */

    describe('getSecretLock', () => {
        it('should return hash lock info given hash', async () => {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            const info = await SecretLockRepo.getSecretLock(secret).toPromise();
            expect(info.ownerAddress.plain()).to.be.equal(account.address.plain());
            expect(info.recipientAddress.plain()).to.be.equal(account2.address.plain());
            expect(info.amount.toString()).to.be.equal('10');
        });
    });

    describe('searchSecretLock', () => {
        it('should return hash lock page info', async () => {
            const info = await SecretLockRepo.search({ address: account.address }).toPromise();
            expect(info.data.length).to.be.greaterThan(0);
        });
    });

    describe('searchSecretLock with streamer', () => {
        it('should return hash lock page info', async () => {
            const streamer = new SecretLockPaginationStreamer(SecretLockRepo);
            const infoStreamer = await streamer
                .search({ address: account.address, pageSize: 20, order: Order.Asc })
                .pipe(take(20), toArray())
                .toPromise();
            const info = await SecretLockRepo.search({ address: account.address, pageSize: 20, order: Order.Asc }).toPromise();
            expect(infoStreamer.length).to.be.greaterThan(0);
            deepEqual(infoStreamer[0], info.data[0]);
        });
    });
});
