/*
 * Copyright 2020 NEM
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
import { IntegrationTestHelper } from '../infrastructure/IntegrationTestHelper';
import { AccountService } from '../../src/service/AccountService';
import { NamespaceRegistrationTransaction } from '../../src/model/transaction/NamespaceRegistrationTransaction';
import { NamespaceId } from '../../src/model/namespace/NamespaceId';

describe('AccountService', () => {
    const helper = new IntegrationTestHelper();
    let generationHash: string;
    let account: Account;
    let networkType: NetworkType;
    let accountService: AccountService;
    let namespaceId: NamespaceId;
    const name = 'root-test-namespace-' + Math.floor(Math.random() * 10000);

    before(() => {
        return helper.start().then(() => {
            account = helper.account;
            generationHash = helper.generationHash;
            networkType = helper.networkType;
            accountService = new AccountService(helper.repositoryFactory);
        });
    });
    before(() => {
        return helper.listener.open();
    });

    after(() => {
        helper.listener.close();
    });

    /**
     * =========================
     * Setup test data
     * =========================
     */
    describe('Create a namespace', () => {
        it('Announce NamespaceRegistrationTransaction', () => {
            const registerNamespaceTransaction = NamespaceRegistrationTransaction.createRootNamespace(
                Deadline.create(),
                name,
                UInt64.fromUint(300000),
                networkType,
                helper.maxFee,
            );
            namespaceId = new NamespaceId(name);
            const signedTransaction = registerNamespaceTransaction.signWith(account, generationHash);
            return helper.announce(signedTransaction);
        });
    });

    /**
     * =========================
     * Test
     * =========================
     */
    describe('call accountInfoWithResolvedMosaic', () => {
        it('accountInfoWithResolvedMosaic', async () => {
            const info = await accountService.accountInfoWithResolvedMosaic([account.address]).toPromise();
            expect(info).to.not.be.undefined;
            expect(info[0].resolvedMosaics).to.not.be.undefined;
            expect(info[0].resolvedMosaics?.length).to.be.greaterThan(0);
        });
    });

    describe('call accountNamespacesWithName', () => {
        it('accountNamespacesWithName', async () => {
            const info = await accountService.accountNamespacesWithName(account.address).toPromise();
            expect(info).to.not.be.undefined;
            expect(info.find((i) => i.id.equals(namespaceId))).to.not.be.undefined;
            expect(info.find((i) => i.id.equals(namespaceId))?.namespaceName).to.be.equal(name);
        });
    });
});