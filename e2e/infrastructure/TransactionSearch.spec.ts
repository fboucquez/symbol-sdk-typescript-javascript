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
import { toArray } from 'rxjs/operators';
import { Convert } from '../../src/core/format';
import { TransactionGroup, TransactionPaginationStreamer } from '../../src/infrastructure/infrastructure';
import { TransactionRepository } from '../../src/infrastructure/TransactionRepository';
import { Account } from '../../src/model/account/Account';
import { Transaction } from '../../src/model/transaction/Transaction';
import { IntegrationTestHelper } from './IntegrationTestHelper';

describe('TransactionHttp', () => {
    const helper = new IntegrationTestHelper();

    let transactionRepository: TransactionRepository;
    let generationHash: string;

    Account.generateNewAccount(helper.networkType);

    before(() => {
        return helper.start({ openListener: false }).then(() => {
            transactionRepository = helper.repositoryFactory.createTransactionRepository();
            generationHash = helper.generationHash;
        });
    });

    after(() => {
        return helper.close();
    });

    describe('Search Transactions', () => {
        it('standalone', async () => {
            const criteria = {
                group: TransactionGroup.Confirmed,
            };
            const streamer = new TransactionPaginationStreamer(transactionRepository);
            const transactions = await streamer.search(criteria).pipe(toArray()).toPromise();

            transactions.forEach((t) => {
                const originalHash = t.transactionInfo!.hash;

                const calcHash = Transaction.createTransactionHash(t.serialize(), Array.from(Convert.hexToUint8(generationHash)));
                try {
                    expect(originalHash, `Invalid hash checking transaction\n ${JSON.stringify(t.toJSON(), null, 2)}`).to.be.eq(calcHash);
                    console.log(`${t.transactionInfo?.id} ${t.type} valid!`);
                } catch (e) {
                    console.log(`${t.transactionInfo?.id} ${t.type} INVALID!!!!`);
                    console.log(e);
                }
            });
        });
    });
});
