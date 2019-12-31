<template>
<div>
  <div class="transfer-card">
	<ValidationObserver v-slot="{ invalid }">
	  <van-cell-group title="收款账号" :border="false">
		<ValidationProvider v-slot="{ errors }" rules="required" name="receiver">
		  <van-field
		  v-model="transferForm.receiver"
		  :error-message="errors[0]"
		  placeholder="请输入收款账号" />
		</ValidationProvider>
	  </van-cell-group>
	  <van-cell-group title="转账数量" :border="false">
		<ValidationProvider v-slot="{ errors }" rules="required|min_value:0.01" name="amount">
		  <van-field
		  v-model="transferForm.amount"
		  type="number"
		  :error-message="errors[0]"
		  placeholder="请输入转账数量" />
		  <van-cell title="钱包余额" :value="walletInfo.free_balance | money" />
		</ValidationProvider>
	  </van-cell-group>
	  <van-cell-group title="Memo" :border="false">
		<ValidationProvider v-slot="{ errors }" name="memo">
		  <van-field v-model="transferForm.memo"
		  :error-message="errors[0]"
		  placeholder="请输入memo" />
		</ValidationProvider>
	  </van-cell-group>
	  <van-button type="primary" square size="large"
	  :disabled="invalid" @click="handleSubmit">确认转账</van-button>
	</ValidationObserver>
  </div>
</div>
</template>
<script>
import { mapState } from 'vuex'
import { didToHex, formatNumber } from '@/util/common'
import { decodeAvatar } from '@/util/api'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
export default {
	name: 'walletTransfer',
	data() {
		return {
			qrcode: null,
			showDetail: false,
			transferForm: {
				receiver: '',
				amount: '',
				memo: ''
			},
			avatar: ''
		};
	},
	computed: {
		...mapState([
			'walletInfo'
		])
	},
	components: {
		ValidationProvider,
		ValidationObserver
	},
	methods: {
		async handleSubmit() {
			this.$dialog.confirm({
				title: '请确认您的转账信息',
				message: `收款账号：${this.transferForm.receiver}\n金额：${(this.transferForm.amount)} PRA`,
				messageAlign: 'left'
			}).then(() => {
				const receiver = didToHex(this.transferForm.receiver)
				const amount = formatNumber(this.transferForm.amount)
				const memo = this.transferForm.memo || 'transfer'

				const data = JSON.stringify({
					address: this.walletInfo.address,
					method: 'transfer',
					params: [receiver, amount, memo]
				});

				this.$socket.emit('sign', data)
				this.$store.commit('showLoading')
			}).catch(console.log)
		},
		beforeUpload(file) {
			console.log(file);
			const maxFileSize = 1024 * 1024 * 10;
			if (!/.(gif|jpg|jpeg|png|gif|jpg|png)$/.test(file.name)) {
				this.$toast('图片类型必须是gif,jpeg,jpg,png中的一种');
				return false;
			}
			if (file.size > maxFileSize) {
				this.$toast('图片尺寸超过10M了');
				return false;
			}
		},
		async handleSuccess(res) {
			console.log(res);
			const src = `https://static.chain.pro/${res.data}`
			const { data: { result }} = await decodeAvatar(src)
			if (!result) {
				this.$toast('无法解析您选择的区块链头像')
			} else {
				this.transferForm.receiver = result;
			}
		}
	}
};
</script>

<style lang="scss">
  @import '../../assets/css/variables.scss';
  .transfer-card {
	button {
	  margin-top: 80px;
	}
  }
</style>
