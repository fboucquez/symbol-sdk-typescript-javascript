import { expect } from 'chai';
import { KeyGenerator } from '../../src/core/format/KeyGenerator';
import { NamespaceRepository } from '../../src/infrastructure/NamespaceRepository';
import { RestrictionMosaicRepository } from '../../src/infrastructure/RestrictionMosaicRepository';
import { Account } from '../../src/model/account/Account';
import { MosaicFlags } from '../../src/model/mosaic/MosaicFlags';
import { MosaicId } from '../../src/model/mosaic/MosaicId';
import { MosaicNonce } from '../../src/model/mosaic/MosaicNonce';
import { AliasAction } from '../../src/model/namespace/AliasAction';
import { NamespaceId } from '../../src/model/namespace/NamespaceId';
import { NetworkType } from '../../src/model/network/NetworkType';
import { MosaicRestrictionType } from '../../src/model/restriction/MosaicRestrictionType';
import { AddressAliasTransaction } from '../../src/model/transaction/AddressAliasTransaction';
import { AggregateTransaction } from '../../src/model/transaction/AggregateTransaction';
import { Deadline } from '../../src/model/transaction/Deadline';
import { MosaicAddressRestrictionTransaction } from '../../src/model/transaction/MosaicAddressRestrictionTransaction';
import { MosaicAliasTransaction } from '../../src/model/transaction/MosaicAliasTransaction';
import { MosaicDefinitionTransaction } from '../../src/model/transaction/MosaicDefinitionTransaction';
import { MosaicGlobalRestrictionTransaction } from '../../src/model/transaction/MosaicGlobalRestrictionTransaction';
import { NamespaceRegistrationTransaction } from '../../src/model/transaction/NamespaceRegistrationTransaction';
import { TransactionType } from '../../src/model/transaction/TransactionType';
import { UInt64 } from '../../src/model/UInt64';
import { MosaicRestrictionTransactionService } from '../../src/service/MosaicRestrictionTransactionService';
import { IntegrationTestHelper } from '../infrastructure/IntegrationTestHelper';

describe('MosaicRestrictionTransactionService', () => {
    const epochAdjustment = 1573430400;
    const deadline = Deadline.create(epochAdjustment);
    const key = KeyGenerator.generateUInt64Key('TestKey');
    let account: Account;
    let restrictionRepository: RestrictionMosaicRepository;
    let namespaceRepository: NamespaceRepository;
    let mosaicId: MosaicId;
    let generationHash: string;
    const helper = new IntegrationTestHelper();
    let networkType: NetworkType;
    let namespaceIdAddress: NamespaceId;
    let namespaceIdMosaic: NamespaceId;

    before(() => {
        return helper.start({ openListener: true }).then(() => {
            account = helper.account;
            generationHash = helper.generationHash;
            networkType = helper.networkType;
            restrictionRepository = helper.repositoryFactory.createRestrictionMosaicRepository();
            namespaceRepository = helper.repositoryFactory.createNamespaceRepository();
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

    describe('MosaicDefinitionTransaction', () => {
        it('standalone', () => {
            const nonce = MosaicNonce.createRandom();
            mosaicId = MosaicId.createFromNonce(nonce, account.address);
            const mosaicDefinitionTransaction = MosaicDefinitionTransaction.create(
                Deadline.create(epochAdjustment),
                nonce,
                mosaicId,
                MosaicFlags.create(true, true, true),
                3,
                UInt64.fromUint(1000),
                networkType,
                helper.maxFee,
            );
            const signedTransaction = mosaicDefinitionTransaction.signWith(account, generationHash);
            return helper.announce(signedTransaction);
        });
    });

    describe('MosaicGlobalRestrictionTransaction - with referenceMosaicId', () => {
        it('standalone', () => {
            const mosaicGlobalRestrictionTransaction = MosaicGlobalRestrictionTransaction.create(
                Deadline.create(epochAdjustment),
                mosaicId,
                key,
                UInt64.fromUint(0),
                MosaicRestrictionType.NONE,
                UInt64.fromUint(0),
                MosaicRestrictionType.GE,
                networkType,
                undefined,
                helper.maxFee,
            );
            const signedTransaction = mosaicGlobalRestrictionTransaction.signWith(account, generationHash);
            return helper.announce(signedTransaction);
        });
    });

    describe('MosaicAddressRestrictionTransaction', () => {
        it('aggregate', () => {
            const mosaicAddressRestrictionTransaction = MosaicAddressRestrictionTransaction.create(
                Deadline.create(epochAdjustment),
                mosaicId,
                key,
                account.address,
                UInt64.fromUint(2),
                networkType,
                undefined,
                helper.maxFee,
            );
            const aggregateTransaction = AggregateTransaction.createComplete(
                Deadline.create(epochAdjustment),
                [mosaicAddressRestrictionTransaction.toAggregate(account.publicAccount)],
                networkType,
                [],
                helper.maxFee,
            );
            const signedTransaction = aggregateTransaction.signWith(account, generationHash);
            return helper.announce(signedTransaction);
        });
    });

    describe('NamespaceRegistrationTransaction', () => {
        it('standalone', () => {
            const namespaceName = 'root-test-namespace-' + Math.floor(Math.random() * 10000);
            const registerNamespaceTransaction = NamespaceRegistrationTransaction.createRootNamespace(
                Deadline.create(epochAdjustment),
                namespaceName,
                UInt64.fromUint(50),
                networkType,
                helper.maxFee,
            );
            namespaceIdMosaic = new NamespaceId(namespaceName);
            const signedTransaction = registerNamespaceTransaction.signWith(account, generationHash);

            return helper.announce(signedTransaction);
        });
    });

    describe('NamespaceRegistrationTransaction', () => {
        it('standalone', () => {
            const namespaceName = 'root-test-namespace-' + Math.floor(Math.random() * 10000);
            const registerNamespaceTransaction = NamespaceRegistrationTransaction.createRootNamespace(
                Deadline.create(epochAdjustment),
                namespaceName,
                UInt64.fromUint(50),
                networkType,
                helper.maxFee,
            );
            namespaceIdAddress = new NamespaceId(namespaceName);
            const signedTransaction = registerNamespaceTransaction.signWith(account, generationHash);

            return helper.announce(signedTransaction);
        });
    });

    describe('AddressAliasTransaction', () => {
        it('standalone', () => {
            const addressAliasTransaction = AddressAliasTransaction.create(
                Deadline.create(epochAdjustment),
                AliasAction.Link,
                namespaceIdAddress,
                account.address,
                networkType,
                helper.maxFee,
            );
            const signedTransaction = addressAliasTransaction.signWith(account, generationHash);

            return helper.announce(signedTransaction);
        });
    });

    describe('MosaicAliasTransaction', () => {
        it('standalone', () => {
            const mosaicAliasTransaction = MosaicAliasTransaction.create(
                Deadline.create(epochAdjustment),
                AliasAction.Link,
                namespaceIdMosaic,
                mosaicId,
                networkType,
                helper.maxFee,
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
    describe('Test new services - MosaicGlobalRestriction', () => {
        it('should create MosaicGlobalRestrictionTransaction', () => {
            const service = new MosaicRestrictionTransactionService(restrictionRepository, namespaceRepository);

            return service
                .createMosaicGlobalRestrictionTransaction(
                    deadline,
                    networkType,
                    mosaicId,
                    key,
                    '1',
                    MosaicRestrictionType.GE,
                    undefined,
                    helper.maxFee,
                )
                .toPromise()
                .then((transaction: MosaicGlobalRestrictionTransaction) => {
                    expect(transaction.type).to.be.equal(TransactionType.MOSAIC_GLOBAL_RESTRICTION);
                    expect(transaction.previousRestrictionValue.toString()).to.be.equal('0');
                    expect(transaction.previousRestrictionType).to.be.equal(MosaicRestrictionType.GE);
                    expect(transaction.newRestrictionValue.toString()).to.be.equal('1');
                    expect(transaction.newRestrictionType).to.be.equal(MosaicRestrictionType.GE);
                    expect(transaction.restrictionKey.toHex()).to.be.equal(key.toHex());
                });
        });
    });

    describe('Test new services - MosaicGlobalRestriction', () => {
        it('should create MosaicGlobalRestrictionTransaction using alias', async () => {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            const service = new MosaicRestrictionTransactionService(restrictionRepository, namespaceRepository);
            const transaction = (await service
                .createMosaicGlobalRestrictionTransaction(
                    deadline,
                    networkType,
                    namespaceIdMosaic,
                    key,
                    '2',
                    MosaicRestrictionType.GE,
                    undefined,
                    helper.maxFee,
                )
                .toPromise()) as MosaicGlobalRestrictionTransaction;
            expect(transaction.type).to.be.equal(TransactionType.MOSAIC_GLOBAL_RESTRICTION);
            expect(transaction.previousRestrictionValue.toString()).to.be.equal('0');
            expect(transaction.previousRestrictionType).to.be.equal(MosaicRestrictionType.GE);
            expect(transaction.newRestrictionValue.toString()).to.be.equal('2');
            expect(transaction.newRestrictionType).to.be.equal(MosaicRestrictionType.GE);
            expect(transaction.restrictionKey.toHex()).to.be.equal(key.toHex());
        });
    });

    describe('Test new services - MosaicAddressRestriction', () => {
        it('should create MosaicAddressRestrictionTransaction', () => {
            const service = new MosaicRestrictionTransactionService(restrictionRepository, namespaceRepository);
            return service
                .createMosaicAddressRestrictionTransaction(deadline, networkType, mosaicId, key, account.address, '3', helper.maxFee)
                .toPromise()
                .then((transaction: MosaicAddressRestrictionTransaction) => {
                    expect(transaction.type).to.be.equal(TransactionType.MOSAIC_ADDRESS_RESTRICTION);
                    expect(transaction.previousRestrictionValue.toString()).to.be.equal('2');
                    expect(transaction.newRestrictionValue.toString()).to.be.equal('3');
                    expect(transaction.targetAddressToString()).to.be.equal(account.address.plain());
                    expect(transaction.restrictionKey.toHex()).to.be.equal(key.toHex());
                });
        });
    });

    describe('Test new services - MosaicAddressRestriction', () => {
        it('should create MosaicAddressRestrictionTransaction with address alias', () => {
            const service = new MosaicRestrictionTransactionService(restrictionRepository, namespaceRepository);

            return service
                .createMosaicAddressRestrictionTransaction(deadline, networkType, mosaicId, key, namespaceIdAddress, '4', helper.maxFee)
                .toPromise()
                .then((transaction: MosaicAddressRestrictionTransaction) => {
                    expect(transaction.type).to.be.equal(TransactionType.MOSAIC_ADDRESS_RESTRICTION);
                    expect(transaction.previousRestrictionValue.toString()).to.be.equal('2');
                    expect(transaction.newRestrictionValue.toString()).to.be.equal('4');
                    expect(transaction.targetAddressToString()).to.be.equal(namespaceIdAddress.toHex());
                    expect(transaction.restrictionKey.toHex()).to.be.equal(key.toHex());
                });
        });
    });

    describe('Announce MosaicGlobalRestriction through service', () => {
        it('should create MosaicGlobalRestriction and announce', () => {
            const service = new MosaicRestrictionTransactionService(restrictionRepository, namespaceRepository);
            return service
                .createMosaicGlobalRestrictionTransaction(
                    deadline,
                    networkType,
                    mosaicId,
                    key,
                    '1',
                    MosaicRestrictionType.GE,
                    undefined,
                    helper.maxFee,
                )
                .toPromise()
                .then((transaction: MosaicGlobalRestrictionTransaction) => {
                    const aggregateTransaction = AggregateTransaction.createComplete(
                        Deadline.create(epochAdjustment),
                        [transaction.toAggregate(account.publicAccount)],
                        networkType,
                        [],
                        helper.maxFee,
                    );
                    const signedTransaction = aggregateTransaction.signWith(account, generationHash);
                    return helper.announce(signedTransaction);
                });
        });
    });

    describe('Announce MosaicAddressRestriction through service', () => {
        it('should create MosaicAddressRestriction and announce', () => {
            const service = new MosaicRestrictionTransactionService(restrictionRepository, namespaceRepository);
            return service
                .createMosaicAddressRestrictionTransaction(deadline, networkType, mosaicId, key, account.address, '3', helper.maxFee)
                .toPromise()
                .then((transaction: MosaicAddressRestrictionTransaction) => {
                    const aggregateTransaction = AggregateTransaction.createComplete(
                        Deadline.create(epochAdjustment),
                        [transaction.toAggregate(account.publicAccount)],
                        networkType,
                        [],
                        helper.maxFee,
                    );
                    const signedTransaction = aggregateTransaction.signWith(account, generationHash);
                    return helper.announce(signedTransaction);
                });
        });
    });
});
