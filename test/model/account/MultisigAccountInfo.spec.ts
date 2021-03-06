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
import { MultisigAccountInfo } from '../../../src/model/account/MultisigAccountInfo';
import { NetworkType } from '../../../src/model/network/NetworkType';
import { Address } from '../../../src/model/account/Address';

describe('MultisigAccountInfo', () => {
    const multisigAccountInfoDTO = {
        multisig: {
            accountAddress: Address.createFromPublicKey(
                'B694186EE4AB0558CA4AFCFDD43B42114AE71094F5A1FC4A913FE9971CACD21D',
                NetworkType.PRIVATE_TEST,
            ),
            cosignatoryAddresses: [
                Address.createFromPublicKey('CF893FFCC47C33E7F68AB1DB56365C156B0736824A0C1E273F9E00B8DF8F01EB', NetworkType.PRIVATE_TEST),
                Address.createFromPublicKey('68B3FBB18729C1FDE225C57F8CE080FA828F0067E451A3FD81FA628842B0B763', NetworkType.PRIVATE_TEST),
                Address.createFromPublicKey('DAB1C38C3E1642494FCCB33138B95E81867B5FB59FC4277A1D53761C8B9F6D14', NetworkType.PRIVATE_TEST),
            ],
            minApproval: 3,
            minRemoval: 3,
            multisigAddresses: [
                Address.createFromPublicKey('1674016C27FE2C2EB5DFA73996FA54A183B38AED0AA64F756A3918BAF08E061B', NetworkType.PRIVATE_TEST),
            ],
        },
    };

    it('should createComplete an MultisigAccountInfo object', () => {
        const multisigAccountInfo = new MultisigAccountInfo(
            multisigAccountInfoDTO.multisig.accountAddress,
            multisigAccountInfoDTO.multisig.minApproval,
            multisigAccountInfoDTO.multisig.minRemoval,
            multisigAccountInfoDTO.multisig.cosignatoryAddresses,
            multisigAccountInfoDTO.multisig.multisigAddresses,
        );

        expect(multisigAccountInfo.accountAddress).to.be.equal(multisigAccountInfoDTO.multisig.accountAddress);
        expect(multisigAccountInfo.minApproval).to.be.equal(multisigAccountInfoDTO.multisig.minApproval);
        expect(multisigAccountInfo.minRemoval).to.be.equal(multisigAccountInfoDTO.multisig.minRemoval);
        expect(multisigAccountInfo.cosignatoryAddresses).to.be.equal(multisigAccountInfoDTO.multisig.cosignatoryAddresses);
        expect(multisigAccountInfo.multisigAddresses).to.be.equal(multisigAccountInfoDTO.multisig.multisigAddresses);
    });

    describe('isMultisig', () => {
        it('should return true when it has minApproval different to 0', () => {
            const multisigAccountInfo = new MultisigAccountInfo(
                multisigAccountInfoDTO.multisig.accountAddress,
                1,
                multisigAccountInfoDTO.multisig.minRemoval,
                multisigAccountInfoDTO.multisig.cosignatoryAddresses,
                multisigAccountInfoDTO.multisig.multisigAddresses,
            );
            expect(multisigAccountInfo.isMultisig()).to.be.equal(true);
        });

        it('should return true when it has minRemoval different to 0', () => {
            const multisigAccountInfo = new MultisigAccountInfo(
                multisigAccountInfoDTO.multisig.accountAddress,
                multisigAccountInfoDTO.multisig.minApproval,
                1,
                multisigAccountInfoDTO.multisig.cosignatoryAddresses,
                multisigAccountInfoDTO.multisig.multisigAddresses,
            );
            expect(multisigAccountInfo.isMultisig()).to.be.equal(true);
        });

        it('should return false when it has minRemoval and minApproval equals to 0', () => {
            const multisigAccountInfo = new MultisigAccountInfo(
                multisigAccountInfoDTO.multisig.accountAddress,
                0,
                0,
                multisigAccountInfoDTO.multisig.cosignatoryAddresses,
                multisigAccountInfoDTO.multisig.multisigAddresses,
            );
            expect(multisigAccountInfo.isMultisig()).to.be.equal(false);
        });
    });

    describe('hasCosigner', () => {
        it('should return true when account is in the cosignatories list', () => {
            const multisigAccountInfo = new MultisigAccountInfo(
                multisigAccountInfoDTO.multisig.accountAddress,
                multisigAccountInfoDTO.multisig.minApproval,
                multisigAccountInfoDTO.multisig.minRemoval,
                multisigAccountInfoDTO.multisig.cosignatoryAddresses,
                multisigAccountInfoDTO.multisig.multisigAddresses,
            );

            expect(
                multisigAccountInfo.hasCosigner(
                    Address.createFromPublicKey(
                        'CF893FFCC47C33E7F68AB1DB56365C156B0736824A0C1E273F9E00B8DF8F01EB',
                        NetworkType.PRIVATE_TEST,
                    ),
                ),
            ).to.be.equal(true);
        });

        it('should return false when account is not in the cosignatories list', () => {
            const multisigAccountInfo = new MultisigAccountInfo(
                multisigAccountInfoDTO.multisig.accountAddress,
                multisigAccountInfoDTO.multisig.minApproval,
                multisigAccountInfoDTO.multisig.minRemoval,
                multisigAccountInfoDTO.multisig.cosignatoryAddresses,
                multisigAccountInfoDTO.multisig.multisigAddresses,
            );

            expect(
                multisigAccountInfo.hasCosigner(
                    Address.createFromPublicKey(
                        'B694186EE4AB0558CA4AFCFDD43B42114AE71094F5A1FC4A913FE9971CACD21D',
                        NetworkType.PRIVATE_TEST,
                    ),
                ),
            ).to.be.equal(false);
        });
    });

    describe('isCosignerOfMultisigAccount', () => {
        it('should return true when account is in the multisig account list', () => {
            const multisigAccountInfo = new MultisigAccountInfo(
                multisigAccountInfoDTO.multisig.accountAddress,
                multisigAccountInfoDTO.multisig.minApproval,
                multisigAccountInfoDTO.multisig.minRemoval,
                multisigAccountInfoDTO.multisig.cosignatoryAddresses,
                multisigAccountInfoDTO.multisig.multisigAddresses,
            );

            expect(
                multisigAccountInfo.isCosignerOfMultisigAccount(
                    Address.createFromPublicKey(
                        '1674016C27FE2C2EB5DFA73996FA54A183B38AED0AA64F756A3918BAF08E061B',
                        NetworkType.PRIVATE_TEST,
                    ),
                ),
            ).to.be.equal(true);
        });

        it('should return false when account is not in the multisig account list', () => {
            const multisigAccountInfo = new MultisigAccountInfo(
                multisigAccountInfoDTO.multisig.accountAddress,
                multisigAccountInfoDTO.multisig.minApproval,
                multisigAccountInfoDTO.multisig.minRemoval,
                multisigAccountInfoDTO.multisig.cosignatoryAddresses,
                multisigAccountInfoDTO.multisig.multisigAddresses,
            );

            expect(
                multisigAccountInfo.isCosignerOfMultisigAccount(
                    Address.createFromPublicKey(
                        'B694186EE4AB0558CA4AFCFDD43B42114AE71094F5A1FC4A913FE9971CACD21D',
                        NetworkType.PRIVATE_TEST,
                    ),
                ),
            ).to.be.equal(false);
        });
    });
});
