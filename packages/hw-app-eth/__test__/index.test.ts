import {
  TransactionFactory,
  FeeMarketEIP1559Transaction,
} from '@ethereumjs/tx';
import { parseTransaction } from '../src/ur-parser';

describe('parseTransaction', () => {
  it('should parse a transaction', () => {
    const tx = new FeeMarketEIP1559Transaction({
      'chainId': '0x1',
      'nonce': '0x35',
      'maxPriorityFeePerGas': '0x5f5e100',
      'maxFeePerGas': '0x737be7600',
      'gasLimit': '0x5208',
      'to': '0x5bce2df8447e1e1f75b76564616af400105c8bcd',
      'value': '0x5af3107a4000',
      'data': '0x',
      'accessList': [],
    });
    const txUr = 'UR:ETH-SIGNATURE/OTADTPDAGDOLGYIDINVLFZGEMHPYETPALPFPWKVLEYAOHDFPBZSEVYCXMWOSMTGYSKGTHYFGFLIMOXHSBTZMMWFMRHMSAEJTTYSRSWHTSWGEASAMCYRODPCTUYIOTIMNPRPMMNFEOXFGHPDIDWFXPAFYMUTBMOISHPDSQZGLEYOXJZWKADAXISJEIHKKJKJYJLJTIHLTSSMSST';
    const result = parseTransaction(txUr, tx);

    const txJson = tx.toJSON();
    txJson.v = '0x1';
    txJson.s = '0x1ab82d1fdb67d08eb2ad8e45a4465b272c43b14493d692685b26b44e32a46cf4';
    txJson.r = '0x15c1e12094a79651c54d5e46476aa4610dff943eb997006ed4c3c65ac64a0906';
    txJson.type = tx.type as any;
    const transaction = TransactionFactory.fromTxData(txJson, {
      common: tx.common,
    });

    expect(result).toEqual(transaction);
  });
});

