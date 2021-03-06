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
import { Convert as convert } from '../../core/format';
import { UnresolvedMapping } from '../../core/utils/UnresolvedMapping';
import { Address } from '../../model/account/Address';
import { PublicAccount } from '../../model/account/PublicAccount';
import { EncryptedMessage } from '../../model/message/EncryptedMessage';
import { Message } from '../../model/message/Message';
import { MessageType } from '../../model/message/MessageType';
import { PersistentHarvestingDelegationMessage } from '../../model/message/PersistentHarvestingDelegationMessage';
import { EmptyMessage, PlainMessage } from '../../model/message/PlainMessage';
import { Mosaic } from '../../model/mosaic/Mosaic';
import { MosaicFlags } from '../../model/mosaic/MosaicFlags';
import { MosaicId } from '../../model/mosaic/MosaicId';
import { MosaicNonce } from '../../model/mosaic/MosaicNonce';
import { NamespaceId } from '../../model/namespace/NamespaceId';
import { AccountAddressRestrictionTransaction } from '../../model/transaction/AccountAddressRestrictionTransaction';
import { AccountKeyLinkTransaction } from '../../model/transaction/AccountKeyLinkTransaction';
import { AccountMetadataTransaction } from '../../model/transaction/AccountMetadataTransaction';
import { AccountMosaicRestrictionTransaction } from '../../model/transaction/AccountMosaicRestrictionTransaction';
import { AccountOperationRestrictionTransaction } from '../../model/transaction/AccountOperationRestrictionTransaction';
import { AddressAliasTransaction } from '../../model/transaction/AddressAliasTransaction';
import { AggregateTransaction } from '../../model/transaction/AggregateTransaction';
import { AggregateTransactionCosignature } from '../../model/transaction/AggregateTransactionCosignature';
import { AggregateTransactionInfo } from '../../model/transaction/AggregateTransactionInfo';
import { Deadline } from '../../model/transaction/Deadline';
import { LockFundsTransaction } from '../../model/transaction/LockFundsTransaction';
import { MosaicAddressRestrictionTransaction } from '../../model/transaction/MosaicAddressRestrictionTransaction';
import { MosaicAliasTransaction } from '../../model/transaction/MosaicAliasTransaction';
import { MosaicDefinitionTransaction } from '../../model/transaction/MosaicDefinitionTransaction';
import { MosaicGlobalRestrictionTransaction } from '../../model/transaction/MosaicGlobalRestrictionTransaction';
import { MosaicMetadataTransaction } from '../../model/transaction/MosaicMetadataTransaction';
import { MosaicSupplyChangeTransaction } from '../../model/transaction/MosaicSupplyChangeTransaction';
import { MultisigAccountModificationTransaction } from '../../model/transaction/MultisigAccountModificationTransaction';
import { NamespaceMetadataTransaction } from '../../model/transaction/NamespaceMetadataTransaction';
import { NamespaceRegistrationTransaction } from '../../model/transaction/NamespaceRegistrationTransaction';
import { NodeKeyLinkTransaction } from '../../model/transaction/NodeKeyLinkTransaction';
import { SecretLockTransaction } from '../../model/transaction/SecretLockTransaction';
import { SecretProofTransaction } from '../../model/transaction/SecretProofTransaction';
import { SignedTransaction } from '../../model/transaction/SignedTransaction';
import { Transaction } from '../../model/transaction/Transaction';
import { TransactionInfo } from '../../model/transaction/TransactionInfo';
import { TransactionType } from '../../model/transaction/TransactionType';
import { TransferTransaction } from '../../model/transaction/TransferTransaction';
import { VotingKeyLinkTransaction } from '../../model/transaction/VotingKeyLinkTransaction';
import { VrfKeyLinkTransaction } from '../../model/transaction/VrfKeyLinkTransaction';
import { UInt64 } from '../../model/UInt64';

/**
 * Extract recipientAddress value from encoded hexadecimal notation.
 *
 * If bit 0 of byte 0 is not set (e.g. 0x90), then it is a regular address.
 * Else (e.g. 0x91) it represents a namespace id which starts at byte 1.
 *
 * @param recipientAddress {string} Encoded hexadecimal recipientAddress notation
 * @return {Address | NamespaceId}
 */
export const extractRecipient = (recipientAddress: any): Address | NamespaceId => {
    if (typeof recipientAddress === 'string') {
        return UnresolvedMapping.toUnresolvedAddress(recipientAddress);
    } else if (typeof recipientAddress === 'object') {
        // Is JSON object
        if (recipientAddress.hasOwnProperty('address')) {
            return Address.createFromRawAddress(recipientAddress.address);
        } else if (recipientAddress.hasOwnProperty('id')) {
            return NamespaceId.createFromEncoded(recipientAddress.id);
        }
    }
    throw new Error(`Recipient: ${recipientAddress} type is not recognised`);
};

/**
 * Extract mosaics from encoded UInt64 notation.
 *
 * If most significant bit of byte 0 is set, then it is a namespaceId.
 * If most significant bit of byte 0 is not set, then it is a mosaicId.
 *
 * @param mosaics {Array | undefined} The DTO array of mosaics (with UInt64 Id notation)
 * @return {Mosaic[]}
 */
export const extractMosaics = (mosaics: any): Mosaic[] => {
    if (mosaics === undefined) {
        return [];
    }
    return mosaics.map((mosaicDTO) => {
        const id = UnresolvedMapping.toUnresolvedMosaic(mosaicDTO.id);
        return new Mosaic(id, UInt64.fromNumericString(mosaicDTO.amount));
    });
};

/**
 * Extract message from either JSON payload (unencoded) or DTO (encoded)
 *
 * @param message - message payload
 * @return {Message}
 */
const extractMessage = (message: any): Message => {
    let msgObj = EmptyMessage;
    if (message) {
        const messagePayload = message.payload ? message.payload : message.substring(2);
        const messageType = message.type !== undefined ? message.type : convert.hexToUint8(message.substring(0, 2))[0];

        if (messageType === MessageType.PlainMessage) {
            msgObj = PlainMessage.createFromPayload(messagePayload);
        } else if (messageType === MessageType.EncryptedMessage) {
            msgObj = EncryptedMessage.createFromPayload(messagePayload);
        } else if (messageType === MessageType.PersistentHarvestingDelegationMessage) {
            msgObj = PersistentHarvestingDelegationMessage.createFromPayload(messagePayload);
        }
    }
    return msgObj;
};

/**
 * Extract deadline from json payload.
 * @param deadline - deadline dto
 */
const extractDeadline = (deadline?: string): Deadline => {
    if (!deadline) {
        return Deadline.createEmtpy();
    }
    return Deadline.createFromDTO(deadline);
};

/**
 * @internal
 * Extract transaction meta data
 *
 * @param meta - Transaction meta data
 * @param id - TransactionId
 * @return {TransactionInfo | AggregateTransactionInfo | undefined}
 */
const extractTransactionMeta = (meta: any, id: string): TransactionInfo | AggregateTransactionInfo | undefined => {
    if (!meta) {
        return undefined;
    }
    if (meta.aggregateHash || meta.aggregateId) {
        return new AggregateTransactionInfo(UInt64.fromNumericString(meta.height), meta.index, id, meta.aggregateHash, meta.aggregateId);
    }
    return new TransactionInfo(UInt64.fromNumericString(meta.height), meta.index, id, meta.hash, meta.merkleComponentHash);
};
/**
 * @internal
 * @param transactionDTO
 * @param transactionInfo
 * @returns {any}
 * @constructor
 */
const CreateStandaloneTransactionFromDTO = (transactionDTO, transactionInfo): Transaction => {
    if (transactionDTO.type === TransactionType.TRANSFER) {
        return new TransferTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            extractRecipient(transactionDTO.recipientAddress),
            extractMosaics(transactionDTO.mosaics),
            extractMessage(transactionDTO.message !== undefined ? transactionDTO.message : undefined),
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.NAMESPACE_REGISTRATION) {
        return new NamespaceRegistrationTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            transactionDTO.registrationType,
            transactionDTO.name,
            NamespaceId.createFromEncoded(transactionDTO.id),
            transactionDTO.registrationType === 0 ? UInt64.fromNumericString(transactionDTO.duration) : undefined,
            transactionDTO.registrationType === 1 ? NamespaceId.createFromEncoded(transactionDTO.parentId) : undefined,
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.MOSAIC_DEFINITION) {
        return new MosaicDefinitionTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            MosaicNonce.createFromNumber(transactionDTO.nonce),
            new MosaicId(transactionDTO.id),
            new MosaicFlags(transactionDTO.flags),
            transactionDTO.divisibility,
            UInt64.fromNumericString(transactionDTO.duration),
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.MOSAIC_SUPPLY_CHANGE) {
        return new MosaicSupplyChangeTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            UnresolvedMapping.toUnresolvedMosaic(transactionDTO.mosaicId),
            transactionDTO.action,
            UInt64.fromNumericString(transactionDTO.delta),
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.MULTISIG_ACCOUNT_MODIFICATION) {
        return new MultisigAccountModificationTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            transactionDTO.minApprovalDelta,
            transactionDTO.minRemovalDelta,
            transactionDTO.addressAdditions ? transactionDTO.addressAdditions.map((addition) => extractRecipient(addition)) : [],
            transactionDTO.addressDeletions ? transactionDTO.addressDeletions.map((deletion) => extractRecipient(deletion)) : [],
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.HASH_LOCK) {
        const networkType = transactionDTO.network;
        return new LockFundsTransaction(
            networkType,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            new Mosaic(new MosaicId(transactionDTO.mosaicId), UInt64.fromNumericString(transactionDTO.amount)),
            UInt64.fromNumericString(transactionDTO.duration),
            new SignedTransaction('', transactionDTO.hash, '', TransactionType.AGGREGATE_BONDED, networkType),
            transactionDTO.signature,
            transactionDTO.signerPublicKey ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, networkType) : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.SECRET_LOCK) {
        const recipientAddress = transactionDTO.recipientAddress;
        const mosaicId = UnresolvedMapping.toUnresolvedMosaic(transactionDTO.mosaicId);
        return new SecretLockTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            new Mosaic(mosaicId, UInt64.fromNumericString(transactionDTO.amount)),
            UInt64.fromNumericString(transactionDTO.duration),
            transactionDTO.hashAlgorithm,
            transactionDTO.secret,
            extractRecipient(recipientAddress),
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.SECRET_PROOF) {
        const recipientAddress = transactionDTO.recipientAddress;
        return new SecretProofTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            transactionDTO.hashAlgorithm,
            transactionDTO.secret,
            extractRecipient(recipientAddress),
            transactionDTO.proof,
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.MOSAIC_ALIAS) {
        return new MosaicAliasTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            transactionDTO.aliasAction,
            NamespaceId.createFromEncoded(transactionDTO.namespaceId),
            new MosaicId(transactionDTO.mosaicId),
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.ADDRESS_ALIAS) {
        return new AddressAliasTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            transactionDTO.aliasAction,
            NamespaceId.createFromEncoded(transactionDTO.namespaceId),
            extractRecipient(transactionDTO.address) as Address,
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.ACCOUNT_ADDRESS_RESTRICTION) {
        return new AccountAddressRestrictionTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            transactionDTO.restrictionFlags,
            transactionDTO.restrictionAdditions ? transactionDTO.restrictionAdditions.map((addition) => extractRecipient(addition)) : [],
            transactionDTO.restrictionDeletions ? transactionDTO.restrictionDeletions.map((deletion) => extractRecipient(deletion)) : [],
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.ACCOUNT_OPERATION_RESTRICTION) {
        return new AccountOperationRestrictionTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            transactionDTO.restrictionFlags,
            transactionDTO.restrictionAdditions ? transactionDTO.restrictionAdditions : [],
            transactionDTO.restrictionDeletions ? transactionDTO.restrictionDeletions : [],
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.ACCOUNT_MOSAIC_RESTRICTION) {
        return new AccountMosaicRestrictionTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            transactionDTO.restrictionFlags,
            transactionDTO.restrictionAdditions
                ? transactionDTO.restrictionAdditions.map((addition) => UnresolvedMapping.toUnresolvedMosaic(addition))
                : [],
            transactionDTO.restrictionDeletions
                ? transactionDTO.restrictionDeletions.map((deletion) => UnresolvedMapping.toUnresolvedMosaic(deletion))
                : [],
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.ACCOUNT_KEY_LINK) {
        return new AccountKeyLinkTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            transactionDTO.linkedPublicKey,
            transactionDTO.linkAction,
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.MOSAIC_GLOBAL_RESTRICTION) {
        return new MosaicGlobalRestrictionTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            UnresolvedMapping.toUnresolvedMosaic(transactionDTO.mosaicId),
            UnresolvedMapping.toUnresolvedMosaic(transactionDTO.referenceMosaicId),
            UInt64.fromHex(transactionDTO.restrictionKey),
            UInt64.fromNumericString(transactionDTO.previousRestrictionValue),
            transactionDTO.previousRestrictionType,
            UInt64.fromNumericString(transactionDTO.newRestrictionValue),
            transactionDTO.newRestrictionType,
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.MOSAIC_ADDRESS_RESTRICTION) {
        return new MosaicAddressRestrictionTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            UnresolvedMapping.toUnresolvedMosaic(transactionDTO.mosaicId),
            UInt64.fromHex(transactionDTO.restrictionKey),
            extractRecipient(transactionDTO.targetAddress),
            UInt64.fromNumericString(transactionDTO.previousRestrictionValue),
            UInt64.fromNumericString(transactionDTO.newRestrictionValue),
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.ACCOUNT_METADATA) {
        return new AccountMetadataTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            extractRecipient(transactionDTO.targetAddress),
            UInt64.fromHex(transactionDTO.scopedMetadataKey),
            transactionDTO.valueSizeDelta,
            convert.decodeHex(transactionDTO.value),
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.MOSAIC_METADATA) {
        return new MosaicMetadataTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            extractRecipient(transactionDTO.targetAddress),
            UInt64.fromHex(transactionDTO.scopedMetadataKey),
            UnresolvedMapping.toUnresolvedMosaic(transactionDTO.targetMosaicId),
            transactionDTO.valueSizeDelta,
            convert.decodeHex(transactionDTO.value),
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.NAMESPACE_METADATA) {
        return new NamespaceMetadataTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            extractRecipient(transactionDTO.targetAddress),
            UInt64.fromHex(transactionDTO.scopedMetadataKey),
            NamespaceId.createFromEncoded(transactionDTO.targetNamespaceId),
            transactionDTO.valueSizeDelta,
            convert.decodeHex(transactionDTO.value),
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.VRF_KEY_LINK) {
        return new VrfKeyLinkTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            transactionDTO.linkedPublicKey,
            transactionDTO.linkAction,
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.NODE_KEY_LINK) {
        return new NodeKeyLinkTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            transactionDTO.linkedPublicKey,
            transactionDTO.linkAction,
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    } else if (transactionDTO.type === TransactionType.VOTING_KEY_LINK) {
        return new VotingKeyLinkTransaction(
            transactionDTO.network,
            transactionDTO.version,
            extractDeadline(transactionDTO.deadline),
            UInt64.fromNumericString(transactionDTO.maxFee || '0'),
            transactionDTO.linkedPublicKey,
            transactionDTO.startEpoch,
            transactionDTO.endEpoch,
            transactionDTO.linkAction,
            transactionDTO.signature,
            transactionDTO.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.signerPublicKey, transactionDTO.network)
                : undefined,
            transactionInfo,
        ).setPayloadSize(transactionDTO.size);
    }
    throw new Error('Unimplemented transaction with type ' + transactionDTO.type);
};

/**
 * @internal
 * @param transactionDTO
 * @returns {Transaction}
 * @constructor
 */
export const CreateTransactionFromDTO = (transactionDTO): Transaction => {
    if (
        transactionDTO.transaction.type === TransactionType.AGGREGATE_COMPLETE ||
        transactionDTO.transaction.type === TransactionType.AGGREGATE_BONDED
    ) {
        const innerTransactions = transactionDTO.transaction.transactions
            ? transactionDTO.transaction.transactions.map((innerTransactionDTO) => {
                  const aggregateTransactionInfo = extractTransactionMeta(innerTransactionDTO.meta, innerTransactionDTO.id);
                  innerTransactionDTO.transaction.maxFee = transactionDTO.transaction.maxFee;
                  innerTransactionDTO.transaction.deadline = transactionDTO.transaction.deadline;
                  innerTransactionDTO.transaction.signature = transactionDTO.transaction.signature;
                  return CreateStandaloneTransactionFromDTO(innerTransactionDTO.transaction, aggregateTransactionInfo);
              })
            : [];
        return new AggregateTransaction(
            transactionDTO.transaction.network,
            transactionDTO.transaction.type,
            transactionDTO.transaction.version,
            extractDeadline(transactionDTO.transaction.deadline),
            UInt64.fromNumericString(transactionDTO.transaction.maxFee || '0'),
            innerTransactions,
            transactionDTO.transaction.cosignatures
                ? transactionDTO.transaction.cosignatures.map((aggregateCosignatureDTO) => {
                      return new AggregateTransactionCosignature(
                          aggregateCosignatureDTO.signature,
                          PublicAccount.createFromPublicKey(aggregateCosignatureDTO.signerPublicKey, transactionDTO.transaction.network),
                          UInt64.fromNumericString(aggregateCosignatureDTO.version),
                      );
                  })
                : [],
            transactionDTO.transaction.signature,
            transactionDTO.transaction.signerPublicKey
                ? PublicAccount.createFromPublicKey(transactionDTO.transaction.signerPublicKey, transactionDTO.transaction.network)
                : undefined,
            extractTransactionMeta(transactionDTO.meta, transactionDTO.id),
        ).setPayloadSize(transactionDTO.transaction.size);
    } else {
        return CreateStandaloneTransactionFromDTO(
            transactionDTO.transaction,
            extractTransactionMeta(transactionDTO.meta, transactionDTO.id),
        );
    }
};
