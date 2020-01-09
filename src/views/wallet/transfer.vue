<template>
  <div class="transfer-card">
	<ValidationObserver v-slot="{ invalid }" ref="form">
	  <van-cell-group title="收款账号" :border="false">
		<ValidationProvider v-slot="{ errors }" rules="required" name="receiver">
		  <van-field
		  v-model="transferForm.receiver"
		  :error-message="errors[0]"
		  placeholder="请输入收款账号">
		  <van-uploader
		  slot="right-icon"
		  class="upload"
		  :before-read="beforeUpload"
		  :preview-image="false"
		  :after-read="handleSuccess">
			选择头像
		  </van-uploader>
		  </van-field>
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
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { DISPATCH_SIGN } from '@/vuex/constants'
import { didToHex, formatNumber } from '@/util/common'
import { uploadImg, decodeAvatar } from '@/util/api'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
const intialFormData = {
	receiver: '',
	amount: '',
	memo: ''
}
export default {
	name: 'walletTransfer',
	data() {
		return {
			qrcode: null,
			showDetail: false,
			transferForm: Object.assign({}, intialFormData)
		}
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

				const data = {
					address: this.walletInfo.address,
					method: 'transfer',
					params: [receiver, amount, memo]
				}

				this[DISPATCH_SIGN](data)
				// reset
				this.transferForm = Object.assign({}, intialFormData)
				this.$refs.form.reset()
			}).catch(console.log)
		},
		beforeUpload(file) {
			const maxFileSize = 1024 * 1024 * 10;
			if (!/\.(gif|jpg|jpeg|png|GIF|JPG|JPEG|PNG)$/.test(file.name)) {
				this.$toast('图片类型必须是gif,jpeg,jpg,png中的一种')
				return false
			}
			if (file.size > maxFileSize) {
				this.$toast('图片尺寸超过10M了')
				return false;
			}
			return true
		},
		async handleSuccess(res) {
			try {
				const data = new FormData()
				data.append('file', res.file)
				const rs = await uploadImg(data)
				const { data: { result }} = await decodeAvatar(`https://static.chain.pro/${rs.data}`)
				if (!result) {
					this.$toast('无法解析您选择的区块链头像')
				} else {
					this.transferForm.receiver = result
				}
			} catch (e) {
				console.log(e, 'decode error')
			}
		},
		...mapActions([
			DISPATCH_SIGN
		])
	}
};
</script>

<style lang="scss">
  @import '../../assets/css/variables.scss';
  .transfer-card {
	button {
	  margin-top: 80px;
	}
	.van-uploader {
		display: block;
		.van-uploader__upload  {
			width: auto;
			height: auto;
			border: none;
			margin: 0;
		}
	}
  }
</style>
